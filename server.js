const express = require('express')
const multer = require("multer");
const fs = require('fs');
const mysql = require('mysql2');
const crypto = require("crypto")
const imagesFolder = __dirname + "\\public\\images\\";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = imagesFolder;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
});

const upload = multer({storage: storage});

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Nice123#',
    database: 'spp_db'
});

db.connect();

db.query('CREATE TABLE IF NOT EXISTS restaurants (' +
    'r_id INT PRIMARY KEY AUTO_INCREMENT,' +
    'r_name VARCHAR(100) UNIQUE NOT NULL,' +
    'r_price VARCHAR(4) NOT NULL,' +
    'r_address VARCHAR(255) NOT NULL,' +
    'r_capacity INT NOT NULL CHECK (r_capacity >= 1),' +
    'r_description TEXT,' +
    'r_link VARCHAR(255) UNIQUE NOT NULL);', (err) => {
    if (err) throw err
})

db.query('CREATE TABLE IF NOT EXISTS images (' +
    'i_id INT PRIMARY KEY AUTO_INCREMENT,' +
    'i_restaurant_id INT NOT NULL,' +
    'i_filepath VARCHAR(255) NOT NULL,' +
    'is_main boolean NOT NULL,' +
    'FOREIGN KEY (i_restaurant_id) references restaurants(r_id) ON DELETE CASCADE);', (err) => {
    if (err) throw err
})

function allowCrossDomain(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', '*');

    next();
}

const server = express();
server.use(allowCrossDomain);
server.use(express.static(__dirname + "/public"));
server.use(express.urlencoded(false));

let subscribers = [];

server.get('/getAllRestaurants', async function (req, res) {
    const name = req.query.name;
    const price = req.query.price;
    const capacityFrom = req.query.capacityFrom;
    const capacityTo = req.query.capacityTo;
    let restaurants = await getAllRestaurants();
    if(name!==undefined && name!=="") restaurants = restaurants.filter(rest => rest.r_name.toUpperCase().includes(name.toUpperCase()));
    if(price!==undefined && price!=="") restaurants = restaurants.filter(rest => rest.r_price===price);
    if(capacityFrom!==undefined && capacityFrom!=="") restaurants = restaurants.filter(rest => rest.r_capacity >= capacityFrom);
    if(capacityTo!==undefined && capacityTo!=="") restaurants = restaurants.filter(rest => rest.r_capacity <= capacityTo);
    res.status(200).send({
        restaurants : restaurants
    });
})

server.get('/long-polling', async function (req, res) {
    let id = Math.floor(Math.random() * 10000000) + 1;
    subscribers[id] = res;
    setTimeout(()=>{
        subscribers[id] = null;
        if(!res.headersSent) {
            res.status(200).send({
                message: "overdue"
            });
        }
    },60*1000);
})

server.get('/getRestaurantById', async function (req, res) {
    const id = req.query.id;

    const restaurants = await getRestaurantById(id)

    res.status(200).send({
        restaurant : restaurants[0]
    });
})

server.get('/getMainImages', async function (req, res) {
    const images = await getMainImages();

    res.status(200).send({
        images : images
    });
})

server.get('/getImages', async function (req, res) {
    const id = req.query.id;
    const images = await getImages(id);

    res.status(200).send({
        images : images
    });
})

server.post('/add-rest', upload.single('image'), async (req, res) => {
    const { name, address, capacity, price, description} = req.body;
    const image = req.file;
    const nameResult = await getAllRestaurants({"r_name":name});
    let correct = true;
    let errors = {};
    if(nameResult.length>0) {
        correct = false;
        errors.nameExistsError = 'Имя ресторана уже занято!';
    }
    if(!correct) {
        if(image!==undefined) fs.rmSync(imagesFolder+image.filename);
        res.status(400).send({ errors: errors });
    }
    else {
        let values = [
            name, address, capacity, price, description, name
        ];
        let fields = ['r_name,r_address,r_capacity,r_price,r_description,r_link'];
        let result = await addRestaurant(values,fields);
        fields = ['i_restaurant_id,i_filepath,is_main'];
        values = [
            result.insertId, image.filename, true
        ];
        await addImage(values, fields);
        await fireLongPolling();
        let id = result.insertId;
        res.status(200).send({id:id});
    }
})

server.put('/change-rest', upload.single('image'), async (req, res) => {
    const id = req.query.id;
    const { name, address, capacity, price, description} = req.body;
    const image = req.file;
    const oldInfo = (await getAllRestaurants({"r_id":id}))[0];
    const nameResult = await getAllRestaurants({"r_name":name});
    let correct = true;
    let errors = {};
    if(nameResult.length>0 && oldInfo.r_name!=nameResult[0].r_name) {
        correct = false;
        errors.nameExistsError = 'Имя ресторана уже занято!';
    }
    if(!correct) {
        if(image!==undefined) fs.rmSync(imagesFolder+image.filename);
        res.status(400).send({ errors: errors });
    }
    else {
        if(image!==undefined) {
            let oldImage = (await getImages(id))[0];
            fs.rmSync(imagesFolder+oldImage.i_filepath);
            await changeImage(oldImage.i_filepath, image.filename)
        }
        let values =
            [name, address, capacity, price, description, name, id];
        let fields = ['r_name','r_address','r_capacity','r_price','r_description','r_link'];
        await updateRestaurant(values,fields,id);
        await fireLongPolling();
        res.status(200).send('RestaurantElement is changed!');
    }
})

server.delete('/delete-rest', async (req, res) => {
    const id = req.query.id;
    const oldInfo = (await getAllRestaurants({"r_id":id}))[0];
    if(oldInfo==undefined) {
        res.status(404).send("RestaurantElement with id "+id+" not exists!");
    }
    else {
        let images = await getImages(id);
        for (let i = 0; i < images.length; i++) {
            try {
                fs.rmSync(imagesFolder + images[i].i_filepath);
            }catch (reason) {

            }
        }
        await deleteRestaurant(id);
        await fireLongPolling();
        res.status(200).send('RestaurantElement is deleted!');
    }
})

//my lovely functions <3

async function fireLongPolling() {
    for (let subscriber of subscribers) {
        if(subscriber!=null) subscriber.status(200).send({message:"updated"});
    }
    subscribers = [];
}

function getAllRestaurants (filter) {
    let sqlQuery = 'SELECT * FROM restaurants';
    let a = 0;
    let values = [];
    for (let filterKey in filter) {
        if(filter[filterKey]!=undefined && filter[filterKey]!=="") {
            if(a==0) {
                sqlQuery += ' WHERE ';
                a++;
            }
            else {
                sqlQuery += ' AND ';
            }
            sqlQuery += filterKey + ' = ? '
            values += filter[filterKey];
        }
    }
    return new Promise(function (resolve, reject) {
        db.query(sqlQuery, values, (err, rests) => {
            if (err) reject(err)
            resolve(rests);
        })
    });
};

function getRestaurantById (id) {
    let sqlQuery = 'SELECT * FROM restaurants WHERE r_id = ?';
    return new Promise(function (resolve, reject) {
        db.query(sqlQuery, [id], (err, rests) => {
            if (err) reject(err)
            resolve(rests);
        })
    });
};

function getMainImages () {
    return new Promise(function (resolve, reject) {
        db.query('SELECT * FROM images WHERE is_main=true', (err, imagesDB) => {
            let images = {};
            for(let i = 0; i<imagesDB.length; i++) {
                images[imagesDB[i].i_restaurant_id] = imagesDB[i].i_filepath;
            }
            if (err) reject(err)
            resolve(images)
        })
    });
};

function getImages (id) {
    return new Promise(function (resolve, reject) {
        db.query('SELECT * FROM images WHERE i_restaurant_id = ? ORDER BY is_main DESC', [id],(err, images) => {
            if (err) reject(err)
            resolve(images)
        })
    });
};

function addRestaurant (values, fields) {
    return new Promise(function (resolve, reject) {
        db.query('insert into restaurants ('+fields+') VALUES (?)', [values], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
};

function updateRestaurant (values, fields) {
    let query = 'update restaurants set ';
    for (let i = 0; i < fields.length-1; i++) {
        query += (fields[i] + " = ?, ");
    }
    query += (fields[fields.length-1] + " = ? where r_id = ?");
    return new Promise(function (resolve, reject) {
        db.query(query, values, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
};

function addImage (values, fields) {
    return new Promise(function (resolve, reject) {
        db.query('insert into images ('+fields+') VALUES (?)', [values], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
};

function changeImage(old_filename, new_filename) {
    return new Promise(function (resolve, reject) {
        db.query('UPDATE images SET i_filepath = ? where i_filepath = ?', [new_filename, old_filename], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


function deleteRestaurant (id) {
    return new Promise(function (resolve, reject) {
        db.query('delete from restaurants where r_id = ?', [id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
};

server.listen(8080)
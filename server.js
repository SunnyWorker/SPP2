const express = require('express');
const app = express();
const multer = require("multer");
const fs = require('fs');
const mysql = require('mysql2');
const imagesFolder = __dirname + "\\public\\images\\";
const jwt = require('jsonwebtoken');
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["*"],
        credentials: true
    }
});
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
require("dotenv").config();
const cors = require('cors');


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

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 }
});

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Nice123#',
    database: 'spp_db'
});

db.connect();

db.query('CREATE TABLE IF NOT EXISTS UserImages (' +
    'ui_id INT PRIMARY KEY AUTO_INCREMENT,' +
    'ui_filepath VARCHAR(255) NOT NULL);', (err) => {
    if (err) throw err
})

db.query('CREATE TABLE IF NOT EXISTS Roles (' +
    'role_id INT PRIMARY KEY AUTO_INCREMENT,' +
    'role_name VARCHAR(255) NOT NULL);', (err) => {
    if (err) throw err
})

db.query('CREATE TABLE IF NOT EXISTS Users (' +
    'u_id INT PRIMARY KEY AUTO_INCREMENT,' +
    'u_nickname VARCHAR(100) UNIQUE NOT NULL,' +
    'u_surname VARCHAR(100) NOT NULL,' +
    'u_name VARCHAR(100) NOT NULL,' +
    'u_patronymic VARCHAR(100),' +
    'u_role_id INT NOT NULL,' +
    'u_email VARCHAR(255) UNIQUE NOT NULL,' +
    'u_password VARCHAR(255) NOT NULL,' +
    'u_sex ENUM("Male","Female","Sok") NOT NULL,' +
    'u_profile_image_id INT DEFAULT 1,' +
    'FOREIGN KEY (u_profile_image_id) references UserImages(ui_id) ON DELETE CASCADE,' +
    'FOREIGN KEY (u_role_id) references Roles(role_id) ON DELETE CASCADE);', (err) => {
    if (err) throw err
})

db.query('CREATE TABLE IF NOT EXISTS Restaurants (' +
    'r_id INT PRIMARY KEY AUTO_INCREMENT,' +
    'r_name VARCHAR(100) UNIQUE NOT NULL,' +
    'r_price VARCHAR(4) NOT NULL,' +
    'r_address VARCHAR(255) NOT NULL,' +
    'r_capacity INT NOT NULL CHECK (r_capacity >= 1),' +
    'r_description TEXT,' +
    'r_owner_id INT NOT NULL,' +
    'FOREIGN KEY (r_owner_id) references Users(u_id) ON DELETE CASCADE);', (err) => {
    if (err) throw err
})

db.query('CREATE TABLE IF NOT EXISTS RestaurantImages (' +
    'ri_id INT PRIMARY KEY AUTO_INCREMENT,' +
    'ri_restaurant_id INT NOT NULL,' +
    'ri_filepath VARCHAR(255) NOT NULL,' +
    'ri_is_main boolean NOT NULL,' +
    'FOREIGN KEY (ri_restaurant_id) references Restaurants(r_id) ON DELETE CASCADE);', (err) => {
    if (err) throw err
})

function allowCrossDomain(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
}

// const verifyUserTokenHttp = (req, res, next) => {
//     if (req.cookies == undefined || req.cookies.JWT == undefined) {
//         return res.status(401).send("Unauthorized request");
//     }
//     const token = req.cookies.JWT;
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded.user;
//         next();
//     } catch (err) {
//         res.status(400).send("Invalid token.");
//     }
// };

app.use(allowCrossDomain);
app.use(cookieParser());
app.use(express.urlencoded(false));

io.on('connection', (socket) => {

    function verifyUserToken (req) {
        if (req.cookies == undefined || req.cookies.JWT == undefined) {
            socket.emit("Unauthorized");
            return false;
        }
        const token = req.cookies.JWT;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded.user;
            return true;
        } catch (err) {
            socket.emit("Unauthorized");
            return false;
        }
    }

    app.post('/load-picture', upload.single('image'), async (req, res) => {
        const image = req.file;
        if(image) res.status(200).send({name:image.filename});
        else res.status(400).send();
    })

    socket.on('getAllRestaurants', async (req) => {
        if(!verifyUserToken(req)) return;
        const name = req.name;
        const price = req.price;
        const capacityFrom = req.capacityFrom;
        const capacityTo = req.capacityTo;
        let restaurants = await getAllRestaurants();
        if(name && name!=="") restaurants = restaurants.filter(rest => rest.r_name.toUpperCase().includes(name.toUpperCase()));
        if(price && price!=="") restaurants = restaurants.filter(rest => rest.r_price===price);
        if(capacityFrom && capacityFrom!=="") restaurants = restaurants.filter(rest => rest.r_capacity >= capacityFrom);
        if(capacityTo && capacityTo!=="") restaurants = restaurants.filter(rest => rest.r_capacity <= capacityTo);
        return socket.emit("getAllRestaurants",restaurants);
    });

    socket.on('getUserInfo', async (req) => {
        if(!verifyUserToken(req)) return socket.emit("getUserInfo","");
        const user = req.user;
        user.u_password = null;
        return socket.emit("getUserInfo",user);
    });

    socket.on('registration', async (req) => {
        let {nickname, surname, name, patronymic, email, password, sex, role} = req;
        const image = req.imageName;
        const nicknameResult = await getAllUsers({"u_nickname":nickname});
        const emailResult = await getAllUsers({"u_email":email});
        let correct = true;
        let errors = {};
        if(nicknameResult.length>0) {
            correct = false;
            errors.nicknameError = 'Никнейм уже занят!';
        }
        if(emailResult.length>0) {
            correct = false;
            errors.emailError = 'Почтовый ящик уже занят!';
        }
        if (req.cookies !== undefined && req.cookies.JWT !== undefined) {
            correct = false;
            errors.alreadyAuthorizedError = 'Вы уже авторизованы!';
        }
        if(!correct) {
            if(image!==undefined) fs.rmSync(imagesFolder+image);
            return socket.emit("Errors",errors);
        }
        else {
            let imageId = 1;
            let fields, values;
            if(image!==undefined) {
                values = [
                    image
                ];
                fields = ['ui_filepath'];
                let result = await addUserImage(values,fields);
                imageId = result.insertId;
            }
            const hash = await bcrypt.hash(password, 10);
            fields = ['u_nickname,u_surname,u_name,u_patronymic,u_email,u_password,u_sex,u_role_id,u_profile_image_id'];
            values = [
                nickname,surname,name,patronymic,email,hash,sex,role,imageId
            ];
            await addUser(values, fields);
            const user = await getUserByEmail(email);
            const token = await jwt.sign({ user }, process.env.JWT_SECRET, {
                expiresIn: "1h",
            });
            let cookieHeader = {};
            cookieHeader.name = "JWT";
            cookieHeader.value = token;
            cookieHeader.options = {
                maxAge: 3600000, path: "/", secure: true, sameSite: false
            };
            socket.emit('set-cookie', cookieHeader);
        }
    });

    socket.on('login', async (req) => {
        let {email, password} = req;
        const user = await getUserByEmail(email);
        let correct = true;
        let errors = {};
        if(!user || !bcrypt.compareSync(password, user.u_password)) {
            correct = false;
            errors.noCorrectDataError= 'Неверный логин или пароль!';
        }
        if (req.cookies !== undefined && req.cookies.JWT !== undefined) {
            correct = false;
            errors.alreadyAuthorizedError = 'Вы уже авторизованы!';
        }
        if(!correct) {
            return socket.emit("Errors",errors);
        }
        else {
            const token = await jwt.sign({ user }, process.env.JWT_SECRET, {
                expiresIn: "1h",
            });
            let cookieHeader = {};
            cookieHeader.name = "JWT";
            cookieHeader.value = token;
            cookieHeader.options = {
                maxAge: 3600000, path: "/", secure: true, sameSite: false
            };
            socket.emit('set-cookie', cookieHeader);
        }
    });

    socket.on('logout', async (req) => {
        socket.emit('clear-cookie', "JWT");
    });

    socket.on('getRestaurantById', async (req) => {
        if(!verifyUserToken(req)) return;
        const id = req.id;
        const restaurant = await getRestaurantById(id)
        return socket.emit("getRestaurantById",restaurant);
    });

    socket.on('getMainImages', async (req) => {
        if(!verifyUserToken(req)) return;
        const images = await getMainRestaurantImages();
        return socket.emit("getMainImages",images);
    });

    socket.on('getImages', async (req) => {
        if(!verifyUserToken(req)) return;
        const id = req.id;
        const images = await getRestaurantImages(id);

        return socket.emit("getImages",images);
    });

    socket.on('add-rest', async (req) => {
        if(!verifyUserToken(req)) return;
        const user = req.user;
        const { name, address, capacity, price, description} = req;
        const image = req.imageName;
        if(user.role_name!=='admin' && user.role_name!=='owner')
            return socket.emit('Вы не можете добавлять рестораны!');
        const nameResult = await getAllRestaurants({"r_name":name});
        let correct = true;
        let errors = {};
        if(nameResult.length>0) {
            correct = false;
            errors.nameExistsError = 'Имя ресторана уже занято!';
        }
        if(!correct) {
            if(image!==undefined) fs.rmSync(imagesFolder+image);
            return socket.emit("Errors",errors);
        }
        else {
            let values = [
                name, address, capacity, price, description, req.user.u_id
            ];
            let fields = ['r_name,r_address,r_capacity,r_price,r_description, r_owner_id'];
            let result = await addRestaurant(values,fields);
            fields = ['ri_restaurant_id,ri_filepath,ri_is_main'];
            values = [
                result.insertId, image, true
            ];
            await addRestaurantImage(values, fields);
            io.emit('update');
            let id = result.insertId;
            return socket.emit("Adding complete!",id);
        }
    });

    socket.on('change-rest', async (req) => {
        const id = req.id;
        if(!verifyUserToken(req)) return;
        const user = req.user;
        const { name, address, capacity, price, description} = req;
        const image = req.imageName;
        const oldInfo = await getRestaurantById(id);
        if(user.role_name!=='admin' && oldInfo.r_owner_id!==user.u_id) {
            return socket.emit('Недостаточно прав!');
        }
        const nameResult = await getAllRestaurants({"r_name":name});
        let correct = true;
        let errors = {};
        if(nameResult.length>0 && oldInfo.r_name!==nameResult[0].r_name) {
            correct = false;
            errors.nameExistsError = 'Имя ресторана уже занято!';
        }
        if(!correct) {
            if(image) fs.rmSync(imagesFolder+image);
            return socket.emit("Errors", errors);
        }
        else {
            if(image) {
                let oldImage = (await getRestaurantImages(id))[0];
                await fs.rm(imagesFolder+oldImage.ri_filepath,()=>{

                });
                await changeRestaurantImage(oldImage.ri_filepath, image)
            }
            let values =
                [name, address, capacity, price, description, id];
            let fields = ['r_name','r_address','r_capacity','r_price','r_description'];
            await updateRestaurant(values,fields,id);
            io.emit('update');
            return  socket.emit('Информация о ресторане изменена!');
        }
    });

    socket.on('delete-rest', async (req) => {
        const r_id = req.id;
        if(!verifyUserToken(req)) return;
        const user = req.user;
        const oldInfo = await getRestaurantById(r_id);
        if(user.role_name!=='admin' && oldInfo.r_owner_id!==user.u_id)
            return socket.emit('Недостаточно прав!');
        if(oldInfo==undefined) {
            return socket.emit("Ресторан с id "+r_id+" не существует!");
        }
        else {
            let images = await getRestaurantImages(r_id);
            for (let i = 0; i < images.length; i++) {
                try {
                    fs.rmSync(imagesFolder + images[i].ri_filepath);
                }catch (reason) {

                }
            }
            await deleteRestaurant(r_id);
            io.emit('update');
            return socket.emit('Ресторан удалён!');
        }
    });
});

//my lovely functions <3

function getAllRestaurants (filter) {
    let sqlQuery = 'SELECT * FROM Restaurants';
    let a = 0;
    let values = [];
    for (let filterKey in filter) {
        if(filter[filterKey]!=undefined && filter[filterKey]!=="") {
            if(a===0) {
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
}

function getRestaurantById (id) {
    let sqlQuery = 'SELECT * FROM Restaurants WHERE r_id = ?';
    return new Promise(function (resolve, reject) {
        db.query(sqlQuery, [id], (err, rests) => {
            if (err) reject(err)
            resolve(rests[0]);
        })
    });
}

function getMainRestaurantImages () {
    return new Promise(function (resolve, reject) {
        db.query('SELECT * FROM RestaurantImages WHERE ri_is_main=true', (err, imagesDB) => {
            let images = {};
            try {
                for(let i = 0; i<imagesDB.length; i++) {
                    images[imagesDB[i].ri_restaurant_id] = imagesDB[i].ri_filepath;
                }
            }
            catch (e) {}
            if (err) reject(err)
            resolve(images)
        })
    });
}

function getRestaurantImages (id) {
    return new Promise(function (resolve, reject) {
        db.query('SELECT * FROM RestaurantImages WHERE ri_restaurant_id = ? ORDER BY ri_is_main DESC', [id],(err, images) => {
            if (err) reject(err)
            resolve(images)
        })
    });
}

function addRestaurant (values, fields) {
    return new Promise(function (resolve, reject) {
        db.query('insert into Restaurants ('+fields+') VALUES (?)', [values], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

function updateRestaurant (values, fields) {
    let query = 'update Restaurants set ';
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
}

function addUser (values, fields) {
    return new Promise(function (resolve, reject) {
        db.query('insert into Users ('+fields+') VALUES (?)', [values], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

function getAllUsers (filter) {
    let sqlQuery = 'SELECT * FROM Users';
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
}

function getUserByEmail(email) {
    let sqlQuery = 'select Users.*,Roles.role_name from Users JOIN Roles On Roles.role_id=Users.u_role_id where u_email=?';
    return new Promise(function (resolve, reject) {
        db.query(sqlQuery, [email], (err, rests) => {
            if (err) reject(err)
            resolve(rests[0]);
        })
    });
}

function addRestaurantImage (values, fields) {
    return new Promise(function (resolve, reject) {
        db.query('insert into RestaurantImages ('+fields+') VALUES (?)', [values], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

function addUserImage (values, fields) {
    return new Promise(function (resolve, reject) {
        db.query('insert into UserImages ('+fields+') VALUES (?)', [values], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

function changeRestaurantImage(old_filename, new_filename) {
    return new Promise(function (resolve, reject) {
        db.query('UPDATE RestaurantImages SET ri_filepath = ? where ri_filepath = ?', [new_filename, old_filename], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}


function deleteRestaurant (id) {
    return new Promise(function (resolve, reject) {
        db.query('delete from Restaurants where r_id = ?', [id], (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    });
}

server.listen(3001, () => {
    console.log('listening on *:3001');
});
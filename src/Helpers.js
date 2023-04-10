export function validateField(ref,value, compareData) {
    if (value === compareData) {
        ref.current.setCustomValidity("Необходимо ввести!");
        return 1;
    } else {
        ref.current.setCustomValidity("");
        return 0;
    }
}

export function validateRadioField(ref,value) {
    if (value == undefined) {
        ref.current.style.color = "#CC0000";
        return 1;
    }
    ref.current.style.color = "black";
    return 0;
}

export function analyzeErrorReason(reason,errorFields, errors) {
    if(reason.response.status===400) {
        let body = reason.response.data;
        for (let i = 0; i < errorFields.length; i++) {
            if (body.errors[errors[i]] !== undefined) {
                errorFields[i].current.style.display = 'block';
                errorFields[i].current.textContent = body.errors[errors[i]];
            } else {
                errorFields[i].current.style.display = 'none';
            }
        }
    }
}
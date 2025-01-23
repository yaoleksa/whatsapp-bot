require("dotenv").config();
const login = require("@xaviabot/fca-unofficial");

console.log({
    "email": process.env.EMAIL,
    "password": process.env.PASSWORD
});

login({
    email: process.env.EMAIL,
    password: process.env.PASSWORD
}, (err, api) => {
    if(err) {
        console.error(err.message);
    }
});
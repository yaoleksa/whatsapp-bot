const login = require("@xaviabot/fca-unofficial");

login({
    email: process.env.EMAIL,
    password: process.env.PASSWORD
}, (err, api) => {
    if(err) {
        console.error(err.message);
    }
});
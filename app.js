// Make nvironmental variables avaliable
require('dotenv').config();

// Enable required packages
const { Client } = require('whatsapp-web.js');
const { default: axios } = require('axios');
const client = new Client();
const ID = 'AKfycbzLKiYidUljg7P8u7aWd8Myd2y3TLsKHZhT3lbldDjKvh3In-0ghxSuL2rQkOQGzpnA';
client.once('ready', () => {
    console.log('is ready');
});

client.on('qr', (qr) => {
    console.log(qr);
});

client.on('message_create', (msg) => {
    axios.post(`https://script.google.com/macros/s/${process.env.ACTIVATION_ID}/exec`, {
        'time': msg.timestamp,
        'from': msg.from,
        'to': msg.to,
        'body': msg.body
    }, {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your_auth_token_here',
        'X-Custom-Header': 'my-custom-value'
    }).then(res => {
        console.log(res);
    })
})

client.initialize();
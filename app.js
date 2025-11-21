// Make nvironmental variables avaliable
require('dotenv').config();

// Enable required packages
const { Client, NoAuth } = require('whatsapp-web.js');
const { default: axios } = require('axios');
const client = new Client({
    authStrategy: new NoAuth(),
    webVersionCache: {
        type: 'none'
    },
    puppeteer: {
        headless: true,
        userDataDir: null,
        args: [
            `--remote-debugging-port=${process.env.PORT || 10000}`,
            '--disable-cache',
            '--disable-application-cache',
            '--disk-cache-size=0',
            '--aggressive-cache-discard',
            '--disable-dev-shm-usage'
        ]
    }
});
// Define logic when the entry point is ready
client.once('ready', () => {
    console.log('is ready');
});

client.on('qr', (qr) => {
    console.log(qr);
});

client.on('message_create', (msg) => {
    if(msg.body) {
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
            console.log(`Response status: ${res.status}`);
        });
    } else {
        console.log('empty message');
    }
})

client.initialize();
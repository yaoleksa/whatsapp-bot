// Make environmental variables avaliable
require('dotenv').config();

// Enable required packages
const { Client, RemoteAuth } = require('whatsapp-web.js');
const { default: axios } = require('axios');
const R2Store = require('./r2-store.js');

const client = new Client({
    authStrategy: new RemoteAuth({
        store: new R2Store({
            bucket: process.env.CF_BUCKET,
            endpoint: process.env.CF_ENDPOINT,
            accessKeyId: process.env.CF_ACCESS_KEY_ID,
            secretAccessKey: process.env.CF_SECRET_ACCESS_KEY,
            forcePathStyle: false
        }),
        clientId: process.env.CF_CLIENT_ID,
        backupSyncIntervalMs: 120000
    }),
    authTimeoutMs: 0,
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/yaoleksa/whatsapp-bot/refs/heads/master/web-cache/2.3000.1030274078.html'
    },
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--remote-debugging-port=10000',
            '--remote-debugging-address=0.0.0.0',
            '--disable-cache',
            '--disable-application-cache',
            '--disk-cache-size=0',
            '--aggressive-cache-discard'
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

client.on('remote_session_saved', () => {
    console.log('session has been saved');
})

client.on('message_create', (msg) => {
    if(msg.body) {
        axios.post(`https://script.google.com/macros/s/${process.env.ACTIVATION_ID}/exec`, {
            'time': msg.timestamp,
            'from': msg.from,
            'to': msg.to,
            'body': msg.body
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer your_auth_token_here',
                'X-Custom-Header': 'my-custom-value'
            }
        }).then(res => {
            console.log(`Response status: ${res.status}`);
        }).catch(err => {
            console.error(err.message);
        });
    } else {
        console.log('empty message');
    }
})

client.initialize();
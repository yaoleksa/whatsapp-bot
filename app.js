const { Client } = require('whatsapp-web.js');
const { default: axios } = require('axios');
const client = new Client();

client.once('ready', () => {
    console.log('is ready');
});

client.on('qr', (qr) => {
    console.log(qr);
});

client.on('message_create', (msg) => {
    axios.post('https://script.google.com/macros/s/AKfycbzi4gUi2de_5F4JFbZLwttFzdcqnnmOtrQl98SVVa06E_pMibD7U6t9uMCLN_izZzAB/exec', {
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
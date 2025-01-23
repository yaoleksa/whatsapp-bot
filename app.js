// Make environment variables available
require('dotenv').config();

const {authenticate} = require('@google-cloud/local-auth');
const { Client } = require('whatsapp-web.js');
const qcode = require('qrcode-terminal');
const {google} = require('googleapis');
const process = require('process');
const fs = require('fs').promises;
const path = require('path');
const http = require('http');

// define port for server
const port = 3000 || process.env.PORT;

// Define the scope which allows edit sheets
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

async function loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(TOKEN_PATH);
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      return null;
    }
  }

async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
      await saveCredentials(client);
    }
    return client;
  }

const client = new Client();

client.once("ready", () => {
    console.log("The client is ready");
});

client.on("qr", qr => {
  console.log(qr);
  // qcode.generate(qr, {
  //     small: true
  // });
});

client.on('message_create', msg => {
  authorize().then(auth => {
    const sheets = google.sheets({
      version: 'v4',
      auth: auth
    });
    const spreadsheetId = process.env.SPREADSHEET_ID;
    const initialRange = process.env.INITIAL_RANGE;
    const valueInputOption = process.env.VALUE_INPUT_OPTION;
    const values = [
      [msg.from, msg.to, msg.body]
    ];
    const resource = {
      values,
    }
    // First of all, we get the last filled cell in the column, to do it we make a get API call and fetch the  length content property
    sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: initialRange
    }).then(content => {
      let range;
      if(content.data.values) {
        range = `WhatsApp!A${content.data.values.length + 1}:C${content.data.values.length + 1}`;
      } else {
        range = 'WhatsApp!A2:C2';
      }
      sheets.spreadsheets.values.update({spreadsheetId, range, valueInputOption, resource});
    });
  }).catch(console.error);
  // console.log(msg);
});

client.initialize();

// initialize server for stable work
http.createServer((req, res) => {}).listen(port, () => {
  console.log(`http://localhost:${port}`);
});
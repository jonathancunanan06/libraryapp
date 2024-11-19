const https = require('https');
const { google } = require('googleapis');

const PROJECT_ID = 'appreport-6ee8a';
const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const SCOPES = [MESSAGING_SCOPE];

function getToken() {
    return new Promise(function (resolve, reject) {
        const key = require('./appreport-6ee8a-firebase-adminsdk-z1ga7-5c892846c0.json');
        const jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            SCOPES,
            null
        );
        jwtClient.authorize(function (err, tokens) {
            if (err) {
                reject(err);
                return;
            } else {
                resolve(tokens.access_token);
            }
        })
    });
}

getToken()
    .then(token => {
        console.log('Token: ' + token);
    })
    .catch(err => {
        console.log(err);
    })
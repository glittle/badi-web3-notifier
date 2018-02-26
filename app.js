'use strict';

require('dotenv').config({
    path: './.env'
});

var admin = require('firebase-admin');

var serviceAccount = require('./firebase.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
});
const main = require('./scripts/main');

let express = require('express');
let expressApp = express();
expressApp.set('port', (process.env.PORT || 8001));

let bodyParser = require('body-parser');
expressApp.use(bodyParser.json({
    type: 'application/json'
}));

expressApp.get('/*', function(request, response) {
    console.log('incoming GET - should be testing only!');
    response.send('hello!');
});

// main incoming call
expressApp.post('/', function(request, response) {
    main.handlePost(request, response);
});

// Start the server
let server = expressApp.listen(expressApp.get('port'), function() {
    console.log('App listening on port %s', server.address().port);
    console.log('Press Ctrl+C to quit.');
});

'use strict';

require('dotenv').config({
    path: './.env'
});


const main = require('./main');
var cors = require('cors')

main.initialize();

let express = require('express');
let expressApp = express();
expressApp.set('port', (process.env.PORT || 8003));

let bodyParser = require('body-parser');
expressApp.use(bodyParser.json({
    type: 'application/json'
}));

expressApp.use(cors());

expressApp.get('/*', function(request, response) {
    console.log('incoming GET - should be testing only!');
    response.send('hello from Wondrous Calendar notifier');
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

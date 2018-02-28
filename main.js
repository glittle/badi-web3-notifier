console.log(' ');
console.log('=== SERVER RESTARTED at', new Date(), '===========================');

var admin = require('firebase-admin');
var serviceAccount = require('./firebase.json');

var timers = {};
var dbRef = {};
var cbRef = {};

function initialize() {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://wondrous-badi-today.firebaseio.com'
    });

    var db = admin.database();
    dbRef = db.ref("/");
    cbRef = db.ref('/requests')

    dbRef.update({
        last_startup: new Date()
    });

    // load existing requests from database
    cbRef.once('value').then(function(snapshot) {
        var list = snapshot.val();
        console.log('loading saved requests');
        // console.log(list);

        Object.keys(list).forEach(token => {
            // console.log(token);
            var when = list[token].when;
            // console.log(when)

            var next = new Date(when);
            var now = new Date();
            var delay = next.getTime() - now.getTime();

            // console.log(delay)

            if (delay > 0) {
                clearTimeout(timers[token]);
                console.log(shorten(token), 'in', Math.round(delay / 100 / 60) / 10, 'min. at', next);
                timers[token] = setTimeout(function(t) {
                    sendNotificationToClient(t);
                }, delay, token);
            }
        })

    });
}

function sendNotificationToClient(token) {
    // This registration token comes from the client FCM SDKs.
    console.log('sending to', shorten(token));

    // See documentation on defining a message payload.
    var message = {
        data: {
            doPulse: "now"
        },
        token: token
    };

    // Send a message to the device corresponding to the provided
    // registration token.
    admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message id:', response);
        })
        .catch((error) => {
            console.log('Error sending message');
            console.log(error);
        });
}

function shorten(token) {
    if (token.length > 20) {
        return token.substring(0, 20) + '...';
    }
    return token;
}

function handlePost(req, res) {
    if (req.method === "OPTIONS") {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
    } else {
        res.header('Access-Control-Allow-Origin', '*');
    }

    var now = new Date();
    var body = req.body;

    // console.log(request)
    // console.log('address', request.connection.remoteAddress)

    console.log('\r\n\r\n---------------------------');
    console.log('------ incoming POST ------');
    console.log('Time', new Date());
    console.log('Body', JSON.stringify(body));

    var token = body.token;
    var delay = body.delay;

    if (!token || !delay) {
        res.send({
            status: 'invalid'
        })
        return;
    }

    // delay = 5000;

    console.log(delay, shorten(token));

    clearTimeout(timers[token]);

    timers[token] = setTimeout(function(t) {
        sendNotificationToClient(t);
    }, delay, token);

    var futureTime = new Date();
    futureTime.setTime(futureTime.getTime() + delay);

    cbRef.child(token).update({
        when: futureTime
    });

    // setTimeout(function() {
    //     sendNotificationToClient('df66tiOiKN4:APA91bG3XwXk64vpyD6hOS_h0_GJNgGiOI-4k85m8ZYiY9stKiX-oeLgEp2DJl4DNADGMfc1OnApklsMJHpofa0m4kZa9qw9PS2uDAq6YKfIvhdAqF3GcehbhoagXQ4nfN2TwXOQCQsE');
    // }, 3000)

    res.send({
        status: 'received'
    });
}

module.exports = {
    handlePost,
    initialize
}

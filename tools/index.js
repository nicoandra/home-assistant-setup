const mqtt = require('mqtt')
const client  = mqtt.connect('mqtt://mosquitto')

const timeouts = {};

client.on('connect', function () {
    console.log("Connected!");
    client.subscribe('stat/sonoff/switch/dev/RESULT', function (err) {})
    client.subscribe('stat/sonoff/switch/office/RESULT', function (err) {})
    client.subscribe('stat/sonoff/switch/living/RESULT', function (err) {})
})

client.on('message', function (topic, message) {
    if (timeouts[topic]) {
        clearTimeout(timeouts[topic]);
    }

    timeouts[topic] = setTimeout(()=> {
        client.publish(topic + '/filtered', message);
        console.log("Sent..." , message);
    }, 500)
    // console.log("Queued..." , message.toString());
})


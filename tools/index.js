const mqtt = require('mqtt')
const client  = mqtt.connect('mqtt://mosquitto')

/*const timeouts = {};
const hitCounters = {};
*/

const topics = {};

client.on('connect', function () {
    console.log("Connected!");
    topics['stat/sonoff/switch/dev/RESULT'] = new topic('stat/sonoff/switch/dev/RESULT');
    topics['stat/sonoff/switch/office/RESULT'] = new topic('stat/sonoff/switch/office/RESULT');
    topics['stat/sonoff/switch/living/RESULT'] = new topic('stat/sonoff/switch/living/RESULT');
})

client.on('message', function (topic, message) {
    topics[topic].queue(message);
})

const topic = class {
    constructor(topic) {
        this.topic = topic;
        this.timeoutId = null;
        this.messageQueue = [];

        client.subscribe(topic, function (err) {
            console.log('Subscribed to topic', topic);
        })
    }

    parse(rawMessage) {
        try {
            return JSON.parse(rawMessage);
        } catch (exception) {
            return message;
        }     
    }

    queue(message) {
        const messageToQueue = this.parse(message);

        this.messageQueue.push(messageToQueue);
        console.log("queueing ", messageToQueue);
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        this.timeoutId = setTimeout(() => {
            this.sendTheAppropriateMessage();
        }, 500);
    }

    sendTheAppropriateMessage() {
        if (this.sequenceOfClicks()) {
            return this.sendSequenceOfClicks();
        }

        this.sendRaw(this.messageQueue.pop());
        this.messageQueue = [];
    }

    sequenceOfClicks() {
        if(this.messageQueue.length === 1) {
            return false;
        }

        const mirror = this.messageQueue.filter((entry) => !(entry['Dimmer'] || false));
        return mirror.length === this.messageQueue.length;
    }

    sendSequenceOfClicks() { 
        this.sendRaw({ clickCounter: this.messageQueue.length });
        this.messageQueue = [];
    }

    sendRaw(message) {
        const messageToSend = typeof message === 'String' ? message : JSON.stringify(message);
        console.log('%s >> %s', this.topic, messageToSend);
        client.publish(this.topic + '/filtered', messageToSend);
    }
}
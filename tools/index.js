const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://mosquitto')

/*const timeouts = {}
const hitCounters = {}
*/

const timeWindow = 500
const topics = {}

const moesDimmers = (process.env['ENABLED_DIMMERS'] || 'dev').split(',')

client.on('connect', function () {
  console.log('Connected!')
  moesDimmers.forEach((dimmerName) => {
    topics[dimmerName] = new topic(dimmerName)
  })
})

client.on('message', function (topic, message) {
  // If the topic starts with stat => Device to Server. Use normal queue here
  if (topic.startsWith('stat')) {
    moesDimmers
      .filter((dimmerName) => topic.includes('/' + dimmerName + '/'))
      .map((dimmerName) => {
        topics[dimmerName].queue(message)})

    return
  }

  if (topic.startsWith('cmnd')) {
    const sendTo = topic.replace('/filtered', '')
    console.log('A command received in %s, sending it to %s', topic, sendTo)

    const affectedDimmers = moesDimmers.filter((dimmerName) => topic.includes('/' + dimmerName + '/'))

    console.log('Affected dimmers', affectedDimmers)
    affectedDimmers.map((dimmerName) => {
      topics[dimmerName].increaseIgnoreCounter()})

    client.publish(sendTo, message)

    return
  }
})

const topic =
class {
  constructor (name) {
    this.name = name
    this.topic = 'stat/sonoff/switch/' + name + '/RESULT'
    this.commandTopic = 'cmnd/sonoff/switch/' + name + '/POWER/filtered'
    this.timeoutId = null
    this.messageQueue = []
    this.ignoreCounter = 0

    client.subscribe(this.topic, (err) => {
      console.log('Subscribed to topic', this.topic)
    })

    client.subscribe(this.commandTopic, (err) => {
      console.log('Subscribed to topic', this.commandTopic)
    })
  }

  increaseIgnoreCounter () {
    this.ignoreCounter++
    console.log('Increasing ignore counter of %s to %d', this.name, this.ignoreCounter)
  }

  parse (rawMessage) {
    try {
      return JSON.parse(rawMessage)
    } catch (exception) {
      return message
    }
  }

  queue (message) {
    const messageToQueue = this.parse(message)

    if (messageToQueue['Command'] == 'Unknown') {
      console.log('Ignore unkown command')
      return
    }

    if (this.ignoreCounter-- > 0) {
      console.log('Voided message "%s" in %s, counter is %d', message, this.topic, this.ignoreCounter)
      return
    }

    this.ignoreCounter = 0
    this.messageQueue.push(messageToQueue)
    console.log('queueing ', messageToQueue)
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }

    this.timeoutId = setTimeout(() => {
      this.sendTheAppropriateMessageToServer()
    }, timeWindow)
  }

  sendTheAppropriateMessageToServer () {
    if (this.sequenceOfClicks()) {
      this.sendSequenceOfClicksToServer()
    } else {
      this.sendRawToServer(this.messageQueue.pop())
    }
    this.messageQueue = []
  }

  sequenceOfClicks () {
    const mirror = this.messageQueue.filter((entry) => !(entry['Dimmer'] || false))
    return mirror.length === this.messageQueue.length
  }

  sendSequenceOfClicksToServer () {
    this.sendRawToServer({ clickCounter: this.messageQueue.length })

    this.messageQueue = []
  }

  sendRawToServer (message) {
    const messageToSend = typeof message === 'String' ? message : JSON.stringify(message)
    console.log('%s >> %s', this.topic + '/filtered', messageToSend)
    client.publish(this.topic + '/filtered', messageToSend)
  }
}

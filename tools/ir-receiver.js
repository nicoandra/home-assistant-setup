var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://192.168.1.106')

client.on('connect', function () {
  client.subscribe('ir-receiver/received', function (err) {
    if (!err) {
    }
  })
})

client.on('message', function (topic, message) {
  // message is Buffer
  const payload = JSON.parse(message.toString())
  // console.log(topic, payload)
  if ('ir-receiver/received' === topic) {
    return handleIR(payload)
  }
})

let history = []
const handleIR = (payload) => {

  /*const signalB = (payload.signalInt - 0xFF0000).toString(2).padStart(16, 0)
  const signalH = (payload.signalInt - 0xFF0000).toString(16).padStart(4, 0)
  console.log(signalB, signalH)*/

  history.push(payload.signalInt)

  const quarters = [0x205, 0x7, 0xf]
  const rows = [0x205, 0x205, 0x205, 0x205, 0x7, 0x27, 0x17, 0x37, 0x0F, 0x2F, 0x1F]

  if (history.length === 2) {
    const common = history.reduce((ac, c) => {
      return ac & c
    }, 999999)

    console.log(common.toString(16).padStart(4, 0))

    const row = rows.reduce((q, n, i) => {
      if (q) return q
      if (n & common === n) return i + 1
      return 0
    }, 0)
    history = []

    console.log({row}, history.length)
  }

  prev = payload.signalInt
}

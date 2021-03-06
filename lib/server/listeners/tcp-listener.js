const { EventEmitter } = require('events')
const net = require('net')

class TCPListener extends EventEmitter {
  constructor (localAddress, localPort, timeout) {
    super()

    this._localAddress = localAddress
    this._localPort = localPort

    this._listener = net.createServer()
    this._listener.on('connection', socket => {
      socket.setTimeout(timeout || 60000)
      this.emit('connection', { socket })
    })
  }
  start () {
    this._listener.listen(this._localPort, this._localAddress)
  }
  stop () {
    return new Promise((resolve, reject) => {
      this._listener.close(err => err ? reject(err) : resolve())
    })
  }
}

module.exports = TCPListener

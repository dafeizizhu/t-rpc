const { EventEmitter } = require('events')
const net = require('net')

class Unconnected {
  constructor (transceiver) {
    this._transceiver = transceiver
  }
  connect () {
    let promise = this._transceiver._connect()
    this._transceiver.setState(new Connecting(this._transceiver))
    promise.then(() => {
      this._transceiver.setState(new Connected(this._transceiver))
      this._transceiver._socket.once('close', () => {
        this._transceiver._close()
        this._transceiver.setState(new Unconnected(this._transceiver))
      })
      this._transceiver._socket.once('timeout', () => {
        console.error('socket timeout')
        this._transceiver._close()
        this._transceiver.setState(new Unconnected(this._transceiver))
      })
      this._transceiver._socket.once('error', error => {
        console.error('socket error', error)
        this._transceiver._close()
        this._transceiver.setState(new Unconnected(this._transceiver))
      })
    }).catch(() => {})
    return promise
  }
  close () {}
  send (buffer) {
    throw new Error('transceiver is not connected')
  }
}

class Connecting {
  constructor (transceiver) {
    this._transceiver = transceiver
  }
  connect () {
    return this._transceiver._subscribeSocketConnect()
  }
  close () {
    this._transceiver._close()
    this._transceiver.setState(new Unconnected(this._transceiver))
  }
  send (buffer) {
    throw new Error('transceiver is connecting')
  }
}

class Connected {
  constructor (transceiver) {
    this._transceiver = transceiver
  }
  connect () {
    return Promise.resolve()
  }
  close () {
    this._transceiver._close()
    this._transceiver.setState(new Unconnected(this._transceiver))
  }
  send (buffer) {
    this._transceiver._send(buffer)
  }
}

class TCPTransceiver extends EventEmitter {
  constructor (remoteAddress, remotePort) {
    super()

    this._state = new Unconnected(this)
    this._remoteAddress = String(remoteAddress)
    this._remotePort = Number(remotePort)
  }
  connect () {
    return this._state.connect()
  }
  close () {
    this._state.close()
  }
  send (buffer) {
    this._state.send(buffer)
  }
  setState (state) {
    this._state = state
  }
  _connect () {
    this._socket = new net.Socket()
    this._socket.setTimeout(60000)
    this._socket.connect(this._remotePort, this._remoteAddress)
    this._socket.on('data', data => this.emit('data', { data }))
    return this._subscribeSocketConnect()
  }
  _subscribeSocketConnect () {
    return new Promise((resolve, reject) => {
      let connectHandler = () => {
        this._socket.removeListener('connect', connectHandler)
        this._socket.removeListener('error', errorHandler)
        this._socket.removeListener('timeout', timeoutHandler)
        resolve()
      }
      let errorHandler = error => {
        this._socket.removeListener('connect', connectHandler)
        this._socket.removeListener('error', errorHandler)
        this._socket.removeListener('timeout', timeoutHandler)
        this._close()
        reject(error)
      }
      let timeoutHandler = () => {
        this._socket.removeListener('connect', connectHandler)
        this._socket.removeListener('error', errorHandler)
        this._socket.removeListener('timeout', timeoutHandler)
        this._close()
        reject(new Error('connect to ' + this._remoteAddress + ':' + this._remotePort + ' timeout'))
      }
      this._socket.once('connect', connectHandler)
      this._socket.once('error', errorHandler)
      this._socket.once('timeout', timeoutHandler)
    })
  }
  _close () {
    this._socket.removeAllListeners()
    this._socket.destroy()
    this._socket = undefined
  }
  _send (buffer) {
    this._socket.write(buffer)
  }
}

module.exports = TCPTransceiver

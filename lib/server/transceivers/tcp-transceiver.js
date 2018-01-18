const { EventEmitter } = require('events')

class TCPTransceiver extends EventEmitter {
  constructor (socket) {
    super()

    this._socket = socket
    this._socket.on('data', data => this.emit('data', { data }))
    this._socket.on('close', () => {
      this.close()
      this.emit('close')
    })
    this._socket.on('timeout', () => {
      this.close()
      this.emit('close')
    })
    this._socket.on('error', error => {
      console.warn('socket error', error.message)
      this.close()
      this.emit('close')
    })
  }
  send (buffer) {
    if (this._socket) {
      this._socket.write(buffer)
    }
  }
  close () {
    if (this._socket) {
      this._socket.removeAllListeners()
      this._socket.destroy()
      this._socket = undefined
    }
  }
}

module.exports = TCPTransceiver

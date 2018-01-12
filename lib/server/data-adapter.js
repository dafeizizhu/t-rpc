const { EventEmitter } = require('events')

const { create } = require('./transceivers').factory

class DataAdapter extends EventEmitter {
  constructor (protocolName, socket, Protocol) {
    super()

    this._transceiver = create(protocolName, socket)
    this._transceiver.on('close', () => this.emit('close'))
    this._transceiver.on('data', ({ data }) => this._protocol.feed(data))
    this._protocol = new Protocol()
    this._protocol.on('message', ({ requestMessage }) => this.emit('message', { requestMessage }))
  }
  doResponse (responseMessage) {
    this._transceiver.send(this._protocol.compose(responseMessage))
  }
  doError (error) {
    try {
      this._transceiver.send(this._protocol.composeError(error))
    } catch (error) {
      console.error('doError error', error.message)
      this.destroy()
      this.emit('close')
    }
  }
  destroy () {
    if (this._transceiver) {
      this._transceiver.removeAllListeners()
      this._transceiver.close()
      this._transceiver = null
    }
    if (this._protocol) {
      this._protocol.removeAllListeners()
      this._protocol.reset()
      this._protocol = null
    }
  }
}

module.exports = DataAdapter

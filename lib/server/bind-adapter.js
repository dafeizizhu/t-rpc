const { EventEmitter } = require('events')

const { create } = require('./listeners').factory
const DataAdapter = require('./data-adapter')

class BindAdapter extends EventEmitter {
  constructor (endpointInfo, Protocol, servant) {
    super()

    this._listener = create(endpointInfo)
    this._listener.on('connection', ({ socket }) => {
      this._addDataAdapter(endpointInfo.protocolName, socket, Protocol)
    })
    this._servant = servant
    this._dataAdapters = []
  }
  _addDataAdapter (protocolName, socket, Protocol) {
    console.info('add dataAdapter')
    let dataAdapter = new DataAdapter(protocolName, socket, Protocol)
    dataAdapter.on('close', () => this._removeDataAdapter(dataAdapter))
    dataAdapter.on('message', ({ requestMessage }) => this._doRequest(dataAdapter, requestMessage))
    this._dataAdapters.push(dataAdapter)
  }
  _removeDataAdapter (dataAdapter) {
    console.info('remove dataAdapter')
    let index = this._dataAdapters.indexOf(dataAdapter)
    if (index >= 0) {
      this._dataAdapters.splice(index, 1)
    }
    dataAdapter.removeAllListeners()
    dataAdapter.destroy()
    dataAdapter = null
  }
  _doRequest (dataAdapter, requestMessage) {
    try {
      this._servant.doRequest(requestMessage).then(({ responseMessage }) => {
        dataAdapter.doResponse(responseMessage)
        this.emit('response', { requestMessage, responseMessage })
      }).catch(error => {
        dataAdapter.doError(error)
        this.emit('response', { requestMessage, error })
      })
    } catch (error) {
      dataAdapter.doError(error)
      this.emit('response', { requestMessage, error })
    }
  }
  start () {
    this._listener.start()
  }
  stop () {
    this._dataAdapters.forEach(dataAdapter => {
      dataAdapter.removeAllListeners()
      dataAdapter.destroy()
      dataAdapter = null
    })

    this._dataAdapters = []
    return this._listener.stop()
  }
}

module.exports = BindAdapter

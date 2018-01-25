const { create } = require('./transceivers').factory

const { defer, TQueue } = require('../util')
const { RpcError, ClientTimeoutError } = require('../util/rpc-error')
const RpcResult = require('../util/rpc-result')

class QueueItem {
  constructor ({ requestId, deferred, requestMessage, startAt, timeoutTimer }) {
    this._requestId = requestId
    this._deferred = deferred
    this._requestMessage = requestMessage
    this._startAt = startAt
    this._timeoutTimer = timeoutTimer
    this._endAt = 0
  }
  get requestId () {
    return this._requestId
  }
  get deferred () {
    return this._deferred
  }
  get requestMessage () {
    return this._requestMessage
  }
  get costTime () {
    return Math.round((this._endAt - this._startAt) * 1000)
  }
  complete () {
    this._endAt = process.uptime()
    clearTimeout(this._timeoutTimer)
  }
  timeout () {
    this._endAt = process.uptime()
  }
}

class AdapterProxy {
  constructor (endpoint, Protocol) {
    this._endpoint = endpoint
    this._protocol = new Protocol()
    this._protocol.on('message', ({ responseMessage }) => this._protocolMessageHandler(responseMessage))
    this._transceiver = create(endpoint)
    this._transceiver.on('data', ({ data }) => {
      try {
        this._protocol.feed(data)
      } catch (error) {
        console.error('feed error', error.message)
        this._transceiver.close()
        this._protocol.reset()
      }
    })
    this._queue = new TQueue('requestId')
    this._timeoutQueue = new TQueue('requestId')
  }
  get endpoint () {
    return this._endpoint
  }
  _timeout (requestId) {
    let item = this._queue.getByKey(requestId)
    item.timeout()
    this._queue.removeByKey(requestId)
    this._timeoutQueue.push(item)
    item.deferred.reject(new ClientTimeoutError('timeout', item.requestMessage, null, item.costTime, this._endpoint))
  }
  _protocolMessageHandler (responseMessage) {
    let { code, message, requestId } = responseMessage
    let item = this._queue.getByKey(requestId)
    if (item) {
      item.complete()
      let { requestMessage } = item
      let costTime = item.costTime
      if (code === 0) {
        item.deferred.resolve(new RpcResult({
          responseMessage,
          requestMessage,
          costTime,
          endpointInfo: this._endpoint
        }))
      } else {
        item.deferred.reject(new RpcError(item.code, message, requestMessage, responseMessage, costTime, this._endpoint))
      }
      this._queue.removeByKey(requestId)
    } else {
      if (this._timeoutQueue.getByKey(requestId)) {
        // remove
        this._timeoutQueue.removeByKey(requestId)
      } else {
        console.warn(`unmatch response with requestId ${requestId}`)
        // refresh
        this._transceiver.close()
        this._protocol.reset()
      }
    }
  }
  doRequest (requestMessage) {
    return this._transceiver.connect().then(() => {
      let deferred = defer()
      try {
        this._transceiver.send(this._protocol.compose(requestMessage))
      } catch (error) {
        return Promise.reject(new RpcError(-999, 'compose error', requestMessage, null, 0, this._endpoint))
      }

      let { requestId } = requestMessage
      if (requestMessage.packetType === 1) {
        return Promise.reject(new RpcError(-999, 'one way no response', requestMessage, null, 0, this._endpoint))
      } else {
        this._queue.push(new QueueItem({
          requestId,
          deferred,
          requestMessage,
          startAt: process.uptime(),
          timeoutTimer: setTimeout(() => this._timeout(requestId), this._endpoint.timeout)
        }))
        return deferred.promise
      }
    }).catch(error => {
      if (error instanceof RpcError) {
        return Promise.reject(error)
      } else {
        return Promise.reject(new RpcError(-999, error.message, requestMessage, null, 0, this._endpoint))
      }
    })
  }
  destroy () {
    this._queue.forEach(item => item.complete())
    this._queue.destroy()
    this._queue = null
    this._timeoutQueue.destroy()
    this._timeoutQueue = null
    this._protocol.reset()
    this._protocol = null
    this._transceiver.close()
    this._transceiver = null
  }
}

module.exports = AdapterProxy

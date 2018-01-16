const { EventEmitter } = require('events')
const sinon = require('sinon')

let socketStubs = []

class SocketStub extends EventEmitter {
  constructor () {
    super()

    this._connectSpy = sinon.spy()
    this._destroySpy = sinon.spy()
    this._writeSpy = sinon.spy()

    socketStubs.push(this)
  }
  connect (port, address) {
    this._connectSpy(port, address)
  }
  destroy () {
    this._destroySpy()
  }
  write (buffer) {
    this._writeSpy(buffer)
  }
}

let serverStubs = []

class ServerStub extends EventEmitter {
  constructor () {
    super()

    this._listenSpy = sinon.spy()
    this._closeSpy = sinon.spy()

    serverStubs.push(this)
  }
  listen (port, address) {
    if (this._listenCb) this._listenCb()
    this._listenSpy(port, address)
  }
  close (cb) {
    this._closeCb = cb
    this._closeSpy(cb)
  }
}

let netStub = {
  Socket: SocketStub,
  Server: ServerStub,
  createServer: () => new ServerStub(),
  getSocketStubs: () => socketStubs,
  getServerStubs: () => serverStubs
}

exports.net = netStub

exports.clear = () => {
  socketStubs = []
  serverStubs = []
}

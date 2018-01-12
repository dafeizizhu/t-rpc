/* global describe, it, beforeEach */

const sinon = require('sinon')
const proxyquire = require('proxyquire')
const assert = require('assert')

const stubs = require('../../stubs')

const TCPListener = proxyquire('../../../lib/server/listeners/tcp-listener', {
  net: stubs.net
})

describe('TCPListener', () => {
  let address = 'mock address'
  let port = 123
  let socketStub = new stubs.net.Socket()

  beforeEach(() => {
    stubs.clear()
  })

  it('test', done => {
    let listener = new TCPListener(address, port)
    let onConnectionSpy = sinon.spy()
    listener.on('connection', onConnectionSpy)

    let serverStubs = stubs.net.getServerStubs()
    assert.equal(serverStubs.length, 1)
    let serverStub = serverStubs[0]

    listener.start()
    assert.equal(serverStub._listenSpy.callCount, 1)
    let listenSpyCall = serverStub._listenSpy.getCall(0)
    assert.deepEqual(listenSpyCall.args, [port, address])

    serverStub.emit('connection', socketStub)
    assert.equal(onConnectionSpy.callCount, 1)
    let onConnectionSpyCall = onConnectionSpy.getCall(0)
    assert.deepEqual(onConnectionSpyCall.args, [{ socket: socketStub }])

    let promise = listener.stop()
    assert.equal(serverStub._closeSpy.callCount, 1)
    setTimeout(() => serverStub._closeCb(), 100)
    promise.then(done, done)
  })
  it('close with error', done => {
    let listener = new TCPListener(address, port)
    let onConnectionSpy = sinon.spy()
    listener.on('connection', onConnectionSpy)

    let serverStubs = stubs.net.getServerStubs()
    assert.equal(serverStubs.length, 1)
    let serverStub = serverStubs[0]

    listener.start()
    assert.equal(serverStub._listenSpy.callCount, 1)
    let listenSpyCall = serverStub._listenSpy.getCall(0)
    assert.deepEqual(listenSpyCall.args, [port, address])

    serverStub.emit('connection', socketStub)
    assert.equal(onConnectionSpy.callCount, 1)
    let onConnectionSpyCall = onConnectionSpy.getCall(0)
    assert.deepEqual(onConnectionSpyCall.args, [{ socket: socketStub }])

    let promise = listener.stop()
    assert.equal(serverStub._closeSpy.callCount, 1)
    setTimeout(() => serverStub._closeCb(new Error('foo')), 100)
    promise.then(() => {
      done(new Error('?'))
    }).catch(error => {
      assert.equal(error.message, 'foo')
      done()
    })
  })
})

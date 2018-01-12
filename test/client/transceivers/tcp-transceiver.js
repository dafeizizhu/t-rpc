/* global describe, it, beforeEach */

const sinon = require('sinon')
const proxyquire = require('proxyquire')
const assert = require('assert')

const stubs = require('../../stubs')

const TCPTransceiver = proxyquire('../../../lib/client/transceivers/tcp-transceiver', {
  net: stubs.net
})

describe('TCPTransceiver', () => {
  let address = 'mock address'
  let port = 123
  let requestBuffer = Buffer.from([1, 2, 3, 4])
  let responseBuffer = Buffer.from([1, 7, 3, 5])
  beforeEach(() => {
    stubs.clear()
  })
  it('test', async () => {
    let transceiver = new TCPTransceiver(address, port)
    let onDataSpy = sinon.spy()
    transceiver.on('data', onDataSpy)

    let socketStub

    // if not connected, throw error when invoking send
    assert.throws(() => transceiver.send())
    // if not connected, make sure no error throws when invoking close
    assert.doesNotThrow(() => transceiver.close())

    // async step 1. trigger connect
    setTimeout(() => {
      socketStub.emit('connect')
    }, 100)

    await Promise.all([0, 1, 2, 3, 4].map(i => {
      let promise = transceiver.connect()

      // test send during connecting
      assert.throws(() => transceiver.send())
      // make sure during the connecting period, socket will only initialize once
      let socketStubs = stubs.net.getSocketStubs()
      assert(socketStubs.length === 1)
      socketStub = socketStubs[0]
      assert.equal(socketStub._writeSpy.callCount, 0)
      return promise
    }))

    // after connect
    assert.equal(socketStub._connectSpy.callCount, 1)
    let spyCall = socketStub._connectSpy.getCall(0)
    assert.deepEqual(spyCall.args, [port, address])

    // connect again
    await transceiver.connect()
    // but not invoke socket.connect
    assert.equal(socketStub._connectSpy.callCount, 1)

    // send data
    transceiver.send(requestBuffer)
    assert.equal(socketStub._writeSpy.callCount, 1)
    spyCall = socketStub._writeSpy.getCall(0)
    assert.deepEqual(spyCall.args, [requestBuffer])

    // receive data
    socketStub.emit('data', responseBuffer)
    assert.equal(onDataSpy.callCount, 1)
    spyCall = onDataSpy.getCall(0)
    assert.deepEqual(spyCall.args, [{ data: responseBuffer }])

    // close
    transceiver.close()
    assert.equal(socketStub._destroySpy.callCount, 1)
    // close again
    assert.doesNotThrow(() => transceiver.close())
    assert.equal(socketStub._destroySpy.callCount, 1)
    // after close, throw error when invoking send
    assert.throws(() => transceiver.send())
  })
  it('socket close emit', async () => {
    let transceiver = new TCPTransceiver(address, port)
    let socketStub

    // async step 1. trigger connect
    setTimeout(() => {
      let socketStubs = stubs.net.getSocketStubs()
      assert(socketStubs.length === 1)
      socketStub = socketStubs[0]
      socketStub.emit('connect')
    }, 100)

    await transceiver.connect()

    // emit close
    socketStub.emit('close')
    assert.equal(socketStub._destroySpy.callCount, 1)
  })
  it('socket error emit', async () => {
    let transceiver = new TCPTransceiver(address, port)
    let socketStub

    // async step 1. trigger connect
    setTimeout(() => {
      let socketStubs = stubs.net.getSocketStubs()
      assert(socketStubs.length === 1)
      socketStub = socketStubs[0]
      socketStub.emit('connect')
    }, 100)

    await transceiver.connect()

    // emit close
    let error = new Error('foo')
    socketStub.emit('error', error)
    assert.equal(socketStub._destroySpy.callCount, 1)
  })
  it('close when socket is connecting', () => {
    let transceiver = new TCPTransceiver(address, port)
    let socketStub

    transceiver.connect()
    let socketStubs = stubs.net.getSocketStubs()
    assert(socketStubs.length === 1)
    socketStub = socketStubs[0]

    transceiver.close()
    assert.equal(socketStub._destroySpy.callCount, 1)
  })
})

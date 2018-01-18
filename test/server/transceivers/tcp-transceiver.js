/* global describe, it, beforeEach */

const sinon = require('sinon')
const assert = require('assert')

const stubs = require('../../stubs')

const TCPTransceiver = require('../../../lib/server/transceivers/tcp-transceiver')

describe('TCPTransceiver', () => {
  beforeEach(() => {
    stubs.clear()
  })

  let buffer = Buffer.from([1, 2, 3, 4, 5, 54, 54, 43, 43])

  it('test', () => {
    let socketStub = new stubs.net.Socket()
    let transceiver = new TCPTransceiver(socketStub)
    let onDataSpy = sinon.spy()
    transceiver.on('data', onDataSpy)

    socketStub.emit('data', buffer)

    assert.equal(onDataSpy.callCount, 1)
    let onDataSpyCall = onDataSpy.getCall(0)
    assert.deepEqual(onDataSpyCall.args, [{ data: buffer }])

    transceiver.send(buffer)
    assert.equal(socketStub._writeSpy.callCount, 1)
    let writeSpyCall = socketStub._writeSpy.getCall(0)
    assert.deepEqual(writeSpyCall.args, [buffer])

    transceiver.close()
    assert.equal(socketStub._destroySpy.callCount, 1)
  })
  it('socket error emit', () => {
    let socketStub = new stubs.net.Socket()
    let transceiver = new TCPTransceiver(socketStub)
    let onCloseSpy = sinon.spy()
    transceiver.on('close', onCloseSpy)

    socketStub.emit('error', new Error('foo'))

    assert.equal(onCloseSpy.callCount, 1)
    assert.equal(socketStub._destroySpy.callCount, 1)
  })
  it('socket timeout emit', () => {
    let socketStub = new stubs.net.Socket()
    let transceiver = new TCPTransceiver(socketStub)
    let onCloseSpy = sinon.spy()
    transceiver.on('close', onCloseSpy)

    socketStub.emit('timeout')

    assert.equal(onCloseSpy.callCount, 1)
    assert.equal(socketStub._destroySpy.callCount, 1)
  })
  it('socket close emit', () => {
    let socketStub = new stubs.net.Socket()
    let transceiver = new TCPTransceiver(socketStub)
    let onCloseSpy = sinon.spy()
    transceiver.on('close', onCloseSpy)

    socketStub.emit('close')

    assert.equal(onCloseSpy.callCount, 1)
    assert.equal(socketStub._destroySpy.callCount, 1)
  })
})

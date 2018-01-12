/* global describe, it */

const assert = require('assert')
const proxyquire = require('proxyquire')

const stubs = require('../../stubs')

const EndpointInfo = require('../../../lib/util/endpoint-info')

const { create } = proxyquire('../../../lib/client/transceivers', {
  net: stubs.net
}).factory

describe('Transceivers', () => {
  let endpointInfo = new EndpointInfo({
    protocolName: 'udp',
    host: 'host',
    port: 1
  })

  it('unimplemented factory', () => {
    assert.throws(() => create(endpointInfo))
  })
})

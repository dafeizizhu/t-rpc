/* global describe, it */

const assert = require('assert')

const EndpointInfo = require('../../lib/util/endpoint-info')

describe('EndpointInfo', () => {
  let protocolName = 'tcp'
  let host = 'host'
  let port = 1231231
  let timeout = 324324
  let endpointName = `${protocolName} -h ${host} -p ${port} -t ${timeout}`
  it('constructor', () => {
    let endpoint = new EndpointInfo({ protocolName, host, port, timeout })
    assert.equal(endpoint.protocolName, protocolName)
    assert.equal(endpoint.host, host)
    assert.equal(endpoint.port, port)
    assert.equal(endpoint.timeout, timeout)
    assert.equal(endpoint.toString(), endpointName)
  })
  it('static parse', () => {
    let endpoint = EndpointInfo.parse(endpointName)
    assert.equal(endpoint.protocolName, protocolName)
    assert.equal(endpoint.host, host)
    assert.equal(endpoint.port, port)
    assert.equal(endpoint.timeout, timeout)
  })
  it('invalid endpoint name', () => {
    assert.throws(() => EndpointInfo.parse('dajfdasjifajsifjasifja'))
  })
})

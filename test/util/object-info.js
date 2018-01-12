/* global describe, it */

const assert = require('assert')

const EndpointInfo = require('../../lib/util/endpoint-info')
const ObjectInfo = require('../../lib/util/object-info')

describe('ObjectInfo', () => {
  let objName = 'ObjName'
  let endpoints = [
    new EndpointInfo({
      protocolName: 'tcp',
      host: 'host1',
      port: 1,
      timeout: 1
    }),
    new EndpointInfo({
      protocolName: 'tcp',
      host: 'host2',
      port: 2,
      timeout: 2
    })
  ]
  let objectInfoName = `${objName}@${endpoints.map(endpoint => endpoint.toString()).join(':')}`
  it('constructor', () => {
    let objectInfo = new ObjectInfo({
      objName, endpoints
    })
    assert.equal(objectInfo.objName, objName)
    assert.deepEqual(objectInfo.endpoints, endpoints)
    assert.equal(objectInfo.toString(), objectInfoName)
  })
  it('static parse', () => {
    let objectInfo = ObjectInfo.parse(objectInfoName)
    assert.equal(objectInfo.objName, objName)
    assert.deepEqual(objectInfo.endpoints, endpoints)

    objectInfo = ObjectInfo.parse(objName)
    assert.deepEqual(objectInfo.endpoints, [])
  })
  it('static parse exception', () => {
    assert.throws(() => ObjectInfo.parse('dfafaf@asfas', 'sfdsfa'))
  })
})

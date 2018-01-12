/* global describe, it */

const assert = require('assert')
const proxyquire = require('proxyquire')

const stubs = require('../../stubs')

const { create } = proxyquire('../../../lib/server/transceivers', {
  net: stubs.net
}).factory

describe('Transceivers', () => {
  it('unimplemented factory', () => {
    assert.throws(() => create('udp'))
  })
})

const TafProtocol = require('./lib/protocols/taf')
const TafClient = require('./lib/client/communicator')
const TafErrors = require('./lib/util/rpc-error')

module.exports = {
  TafProtocol,
  TafClient,
  TafErrors
}

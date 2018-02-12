const TClient = require('./lib/client/t-client')
const TServer = require('./lib/server/t-server')
const errors = require('./lib/util/rpc-error')

module.exports = {
  TClient,
  TServer,
  errors,
  protocols: {
    taf: require('./lib/protocols/taf')
  },
  messages: {
    ResponseMessage: require('./lib/util/response-message'),
    RequestMessage: require('./lib/util/request-message')
  }
}

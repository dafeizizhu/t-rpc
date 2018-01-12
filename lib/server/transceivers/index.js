const TCPTransceiver = require('./tcp-transceiver')

exports.factory = {
  create: (protocolName, socket) => {
    if (protocolName !== 'tcp') throw new Error('not implemented')
    return new TCPTransceiver(socket)
  }
}

exports.TCPTransceiver = TCPTransceiver

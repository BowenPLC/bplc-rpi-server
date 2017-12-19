const coreServer = require('bplc-node-server');
const RPICore = require('./rpiCore').RPICore;

const rpiCore = new RPICore();
const server = new coreServer.server(rpiCore, 8081);
server.init();

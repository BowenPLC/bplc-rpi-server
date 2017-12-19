const coreServer = require('bplc-node-server');
const FakeCore = require('./fakeCore').FakeCore;

const fakeCore = new FakeCore();
const server = new coreServer.server(fakeCore);
server.init();

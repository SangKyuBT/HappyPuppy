const session = require('express-session');
const mySQLStore = require('express-mysql-session')(session);
const {pool} = require('../DAM');
const haur = require('./configs/sessionHauer.json');

const sessionOption = {
  clearExpired: true, 
  checkExpirationInterval: 60000, 
  expiration: haur,  
  createDatabaseTable: true, 
  connectionLimit: 1, 
  endConnectionOnClose: false,
  charset: 'utf8mb4_bin',
  schema: {
    tableName: 'sessions',
    columnNames: {
        session_id: 'session_id',
        expires: 'expires', 
        data: 'data'
    }
  }
}
  
const sessionStore = new mySQLStore(sessionOption, pool); 

module.exports = {
  sessionStore, session
}
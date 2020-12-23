/*
 세션 스토어
*/
const session = require('express-session'); //세션
const mySQLStore = require('express-mysql-session')(session); //mysql 세션 스토어
const {pool} = require('../DAM'); //mysql connection pool
const haur = require('./configs/sessionHauer.json'); //세션 유지 시간

//세션 스토어 옵션
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

const sessionStore = new mySQLStore(sessionOption, pool); //세션 스토어 생성

module.exports = { sessionStore, session }
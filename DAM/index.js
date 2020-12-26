/*
 데이터베이스 엑세스
*/
const mysql = require('mysql');
const _config = require('../config/db_config.json');

let pool = mysql.createPool(_config);

const connection = (sql, params, callback) => {
  pool.getConnection((err, conn) => {
    if(err){
      conn.release();
      callback(err, null);
    }else{
      if(!params){
        conn.query(sql, (err, result) => {
          conn.release();
          callback(err, result);
        })
      }else{ 
        conn.query(sql, params, (err, result) => {
          conn.release();
          callback(err, result);
        })
      }
    }
  })
}

module.exports = { connection, pool }
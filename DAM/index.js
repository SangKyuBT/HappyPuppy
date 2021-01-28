/*
 데이터베이스 엑세스
*/
// const mysql = require('mysql');
const mysql = require('mysql2');
const _config = require('../config/db_config.json');

const pool = mysql.createPool(_config); //트랜잭션 미사용?
const pool_promise = pool.promise();

const connection = async (sql, params, idu = false) => {
  try{
    const conn = await pool_promise.getConnection(async conn => conn);
    try{
      if(idu){
        await conn.beginTransaction();
        var [rows] = await conn.query(sql, params)
        await conn.commit();
      }else{
        var [rows] = await conn.query(sql, params)
      }
      return rows; 
    }catch(err){
      console.error(err);
      !idu || conn.rollback();
      throw new Error(err);
    }finally{
      conn.release();
    }
  }catch(err){  
    console.error(err);
    throw new Error(err);;
  }
}

module.exports = {connection, pool, pool_promise}
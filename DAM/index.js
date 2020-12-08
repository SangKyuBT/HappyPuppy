const mysql = require('mysql');
const _config = require('../config/db_config.json');

let pool = mysql.createPool(_config);

const connection = (callback) => {
    pool.getConnection((err, conn) => {
      callback(err, conn);
    })
}

module.exports = { connection, pool }
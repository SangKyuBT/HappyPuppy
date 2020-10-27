let mysql = require('mysql');//mysql 모듈
let connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',   
    password: 'mysql',
    database: 'puppy'
});

connection.connect(function (err) {   
    if (err) {     
        console.error('mysql connection error');     
        console.error(err);     
        throw err;   
    } 
});

module.exports.connection;
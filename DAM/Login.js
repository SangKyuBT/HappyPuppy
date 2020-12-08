const {select, _delete} = require('./querySelector/login');
const {connection} = require('./');

const DAM = {
    select : (qk, email, callback) => {
        connection((err, conn) => {
            if(err){
                conn.release(); 
                callback(err);
            }else{
                conn.query(select[qk], [email], (err, result) => {
                    conn.release(); 
                    callback(err, result);
                })
            }
        })
    },
    delete : (id, callback) => {
        connection((err, conn) => {
            if(err){
                conn.release(); 
                callback(err);
            }else{
                conn.query(_delete, id, (err) => {
                    conn.release(); 
                    callback(err);
                })
            }
        })
    }
}

module.exports = DAM;
const {select, insert, _delete} = require('./querySelector/join');
const {connection} = require('./');


const DAM = {
    select : (qk, params, callback) => {
        connection((err, conn) => {
            if(err){
                conn.release(); 
                callback(err);
            }else{
                conn.query(select[qk], params, (err, result) => {
                    conn.release(); 
                    callback(err, result);
                })
            }
        })
    },
    insert : (qk, values, callback) => {
        connection((err, conn) => {
            if(err){
                conn.release(); 
                callback(err);
            }else{
                conn.query(insert[qk], values, (err) => {
                    conn.release(); 
                    callback(err);
                })
            }
        })
    },
    delete: (qk, params, callback) => {
        connection((err, conn) => {
            if(err){
                conn.release(); 
                callback(err);
            }else{
                conn.query(_delete[qk], params, (err) => {
                    conn.release(); 
                    callback(err);
                })
            }
        })
    }

}

module.exports = DAM;
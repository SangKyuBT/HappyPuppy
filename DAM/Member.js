const {select, insert, update, _delete} = require('./querySelector/member');
const {connection} = require('./');

const DAM = {
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
    update : (qk, values, callback) => {
        connection((err, conn) => {
            if(err){
                conn.release(); 
                callback(err);
            }else{
                conn.query(update[qk], values, (err) => {
                    conn.release(); 
                    callback(err);
                })
            }
        })
    },
    delete : (qk, params, callback) => {
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
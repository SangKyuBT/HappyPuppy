/*
 마이페이지 DAM
*/
const {select, insert, update, _delete} = require('./sqlSelector/member'); //sql 리턴
const {connection} = require('./'); //커넥션 풀

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
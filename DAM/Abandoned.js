/*
 실종 반려견 DAM
*/
const {select, insert, update, _delete} = require('./sqlSelector/abandoned'); //sql 리턴
const {connection} = require('./'); //커넥션 풀

const DAM = {
    insert : (ab_info, callback) => {
        connection((err, conn) => {
            if(err){
                conn.release(); 
                callback(err);
            }else{
                conn.query(insert, ab_info, (err) => {
                    conn.release(); 
                    callback(err);
                })
            }
        })
    },
    update : (ab_info, num, callback) => {
        connection((err, conn) => {
            if(err){
                conn.release(); 
                callback(err);
            }else{
                conn.query(update, [ab_info, num], (err, result) => {
                    conn.release(); 
                    callback(err, result);
                })
            }
        })
    },
    select : (place, num, callback) =>{
        connection((err, conn) => {
            if(err){
                conn.release(); 
                callback(err);
            }else{
                conn.query(select(place, num), (err, result) => {
                    conn.release(); 
                    callback(err, result);
                })
            }
        })
    },
    delete : (num, email, callback) =>{
        connection((err, conn) => {
            if(err){
                conn.release(); 
                callback(err);
            }else{
                conn.query(_delete, [num, email], (err) => {
                    conn.release(); 
                    callback(err);
                })
            }
        })
    },
};

module.exports = DAM;
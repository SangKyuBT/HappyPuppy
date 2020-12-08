const {select, insert, update, _delete} = require('./querySelector/event');
const {connection} = require('./');

const DAM = {
    insert : (form, callback) => {
        connection((err, conn) => {
            if(err){
                conn.release(); 
                callback(err);
            }else{
                conn.query(insert, form, (err) => {
                    conn.release(); 
                    callback(err);
                })
            }
        })
    },
    select : (start, end, callback) => {
        connection((err, conn) => {
            if(err){
                conn.release(); 
                callback(err);
            }else{
                conn.query(select(start, end), (err, result) => {
                    conn.release(); 
                    callback(err, result);
                })
            }
        })
    },
    update : (form, num, email, callback) => {
        connection((err, conn) => {
            if(err){
                conn.release(); 
                callback(err);
            }else{
                conn.query(update, [form, num, email], (err) => {
                    conn.release(); 
                    callback(err);
                })
            }
        })
    },
    delete : (num, email, callback) => {
        connection((err, conn) => {
            if(err){
                conn.release(); 
                callback(err);
            }else{
                conn.query(_delete, [num, email], (err, result) => {
                    conn.release(); 
                    callback(err, result);
                })
            }
        })
    }
}

module.exports = DAM;
/*
 로그인 DAM
*/
const {select, _delete, insert} = require('./sqlSelector/login'); //sql 리턴
const {connection} = require('./'); //커넥션 풀

const DAM = {
    select : (qk, email, callback) => {
        connection(select[qk], [email], (err, result) => {
            callback(err, result);
        })
    },
    insert : (qk, values, callback) => {
        connection(insert[qk], values, (err, result) => {
            callback(err);
        })
    },
    delete : (id, callback) => {
        connection(_delete, id, (err, result) => {
            callback(err);
        })
    }
}

module.exports = DAM;
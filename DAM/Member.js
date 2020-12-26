/*
 마이페이지 DAM
*/
const {select, insert, update, _delete} = require('./sqlSelector/member'); //sql 리턴
const {connection} = require('./'); //커넥션 풀

const DAM = {
    insert : (qk, values, callback) => {
        connection(insert[qk], values, (err) => {
            callback(err);
        })
    },
    select : (qk, params, callback) => {
        connection(select[qk], params, (err, result) => {
            callback(err, result);
        })
    },
    update : (qk, values, callback) => {
        connection(update[qk], values, (err) => {
            callback(err);
        })
    },
    delete : (qk, params, callback) => {
        connection(_delete[qk], params, (err) => {
            callback(err);
        })
    }
}

module.exports = DAM;
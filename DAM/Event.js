/*
 행사 DAM
*/
const {select, insert, update, _delete} = require('./sqlSelector/event'); //sql 리턴
const {connection} = require('./');

const DAM = {
    insert : (form, callback) => {
        connection(insert, form, (err, result) => {
            callback(err);
        })
    },
    select : (start, end, callback) => {
        connection(select(start, end), (err, result) => {
            callback(err, result);
        })
    },
    update : (form, num, email, callback) => {
        connection(update, [form, num, email], (err) => {
            callback(err);
        })
    },
    delete : (num, email, callback) => {
        connection(_delete, [num, email], (err, result) => {
            callback(err, result);
        })
    }
}

module.exports = DAM;
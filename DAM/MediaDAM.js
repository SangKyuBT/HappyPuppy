/*
 미디어 DAM
*/
import { select, insert, update, _delete } from "./sqlSelector/media"; //sql 리턴
import { connection } from "./"; //커넥션 풀

const DAM = {
    insert : (qk, values, callback) => {
        connection(insert[qk], values, (err) => {
            callback(err);
        })
    },
    update : (qk, params, callback) => {
        connection(update[qk], params, (err) => {
            callback(err);
        })
    },
    select : (qk, params, callback) => {
        connection(select[qk], params, (err, result) => {
            callback(err, result);
        })
    },
    delete : (qk, params, callback) => {
        connection(_delete[qk], params, (err) => {
            callback(err);
        })
    },
}

module.exports = DAM;
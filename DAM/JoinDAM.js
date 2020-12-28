/*
 회원가입 DAM
*/
import { select, insert, _delete } from "./sqlSelector/join"; //sql 리턴
import { connection } from "./"; //커넥션 풀

const DAM = {
    select : (qk, params, callback) => {
        connection(select[qk], params, (err, result) => {
            callback(err, result);
        })
    },
    insert : (qk, values, callback) => {
        connection(insert[qk], values, (err) => {
            callback(err);
        })
    },
    delete: (qk, params, callback) => {
        connection(_delete[qk], params, (err) => {
            callback(err);
        })
    }

}

module.exports = DAM;
/*
 행사 DAM
*/
import { select, insert, update, _delete } from "./sqlSelector/event"; //sql 리턴
import { connection } from "./"; //커넥션 풀

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
    },
    classTest(name){
        console.log(name);
    }
}

module.exports = DAM;
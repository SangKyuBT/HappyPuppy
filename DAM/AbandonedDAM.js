/*
 실종 반려견 DAM
*/
import { select, insert, update, _delete } from "./sqlSelector/abandoned"; //sql 리턴
import { connection } from "./"; //커넥션 풀

class DAM {
    insert(ab_info, callback){
        connection(insert, ab_info, (err) => {
            callback(err);
        })
    };
    update(ab_info, num, callback){
        connection(update,[ab_info, num], (err, result) => {
            callback(err, result);
        })
    };
    select(place, num, callback){
        connection(select(place, num), (err, result) => {
            callback(err, result);
        })
    };
    delete(num, email, callback){
        connection(_delete, [num, email], (err) => {
            callback(err);
        })
    };
};

module.exports = new DAM();
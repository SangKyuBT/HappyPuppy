/*
 실종 반려견 DAM
*/
import { select, insert, update, _delete } from "./sqlSelector/abandoned"; //sql 리턴
import { connection } from "./"; //커넥션 풀

const DAM = {
    select : async (place, num) => {
        return await connection(select(place, num));
    },
    insert : async(ab_info) => {
        return await connection(insert, ab_info, true);
    },
    update : async (...args) => {
        return await connection(update, args, true);
    },
    delete : async (...args) => {
        return await connection(_delete, args, true);
    }
}

module.exports = DAM;
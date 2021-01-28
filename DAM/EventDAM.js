/*
 행사 DAM
*/
import { select, insert, update, _delete } from "./sqlSelector/event"; //sql 리턴
import { connection } from "./"; //커넥션 풀

const DAM = {
    insert : async (form) => {
        return await connection(insert, form, true);
    },
    select : async (start, end) => {
        return await connection(select(start, end));
    },
    update : async (...args) => {
        return await connection(update, args, true);
    },
    delete : async (...args) => {
        return await connection(_delete, args, true);
    }
}

module.exports = DAM;
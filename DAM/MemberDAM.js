/*
 마이페이지 DAM
*/
import { select, insert, update, _delete } from "./sqlSelector/member"; //sql 리턴
import { connection } from "./"; //커넥션 풀

const DAM = {
    insert : async (qk, values) => {
        return await connection(insert[qk], values, true);
    },
    select : async (qk, params) => {
        return await connection(select[qk], params);
    },
    update : async (qk, values) => {
        return await connection(update[qk], values, true);
    },
    delete : async (qk, params) => {
        return await connection(_delete[qk], params, true);
    }
}

module.exports = DAM;
/*
 미디어 DAM
*/
import { select, insert, update, _delete } from "./sqlSelector/media"; //sql 리턴
import { connection } from "./"; //커넥션 풀

const DAM = {
    insert : async (qk, values) => {
        return await connection(insert[qk], values);
    },
    update : async (qk, params) => {
        return await connection(update[qk], params, true);
    },
    select : async (qk, params) => {
        return await connection(select[qk], params, true);

    },
    delete : async (qk, params) => {
        return await connection(_delete[qk], params, true);
    },
}

module.exports = DAM;
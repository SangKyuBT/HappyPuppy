/*
 회원가입 DAM
*/
import { select, insert, _delete } from "./sqlSelector/join"; //sql 리턴
import { connection } from "./"; //커넥션 풀

const DAM = {
    select : async (qk, params) => {
        return await connection(select[qk], params);
    },
    insert : async (qk, values) => {
        return await connection(insert[qk], values, true);
    },
    delete: async (qk, params) => {
        return await connection(_delete[qk], params, true);
    }
}

module.exports = DAM;
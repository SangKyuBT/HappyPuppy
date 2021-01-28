/*
 로그인 DAM
*/
import { select, _delete, insert } from "./sqlSelector/login"; //sql 리턴
import { connection } from "./"; //커넥션 풀

const DAM = {
    select : async (qk, email) => {
        return await connection(select[qk], [email]);
    },
    insert : async (qk, values) => {
        return await connection(insert[qk], values, true);
    },
    delete : async (id) => {
        return await connection(_delete, id, true);
    }
}

module.exports = DAM;
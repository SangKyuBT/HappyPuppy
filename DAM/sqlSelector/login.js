
const select  = {
    "member" : "select password_data from member where email = ?", 
    "sessions" : "select session_id, data from sessions",
    "member_profile" : "select num from member_profile where email = ?"
}

const insert = {
    "member_profile" : "insert into member_profile set ?"
}

const _delete = "delete from sessions where session_id = ?"

module.exports = { select, _delete, insert }
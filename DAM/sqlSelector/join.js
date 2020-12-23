const select = {
    "duplicate_email" : "select email from member where email = ?",
    "join_wait" : "select * from join_waits where certify_number = ? and wait_email = ?",
    "member" : "select count(email) as count from member where email = ?"
}

const insert = {
    "join_wait" : "insert into join_waits set ?",
    "member" : "insert into member set ?",
    "member_profile" : "insert into member_profile (email) values(?)"
}

const _delete = {
    "join_wait" : "delete from join_waits where wait_email = ?",
    "member" : "delete from member where email = ?"
}

module.exports = { select, insert, _delete }

const select  = {
    "member" : "select password_data from member where email = ?", 
    "sessions" : "select session_id, data from sessions"
}

const _delete = "delete from sessions where session_id = ?"

module.exports = {
    select, _delete
}
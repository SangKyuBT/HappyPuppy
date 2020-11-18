const select = {
    "member" : "select count(*) from member where email = ?",
    "channel" : "select * from media where email = ? order by date desc",
    "profile" : "select nickname, img from member_profile where email = ?",
    "script" : "select count(*) as count from script_list where channel_email = ?",
    "my_script" : "select count(*) as count from script_list where channel_email = ? and member_email = ?"
}
const insert = {
    "media" : "insert into media set ?",
    "script_list" : "insert into script_list set ?",
}


const DAO = {
    insert : (qk, values, callback) => {
        connection.query(insert[qk], values, (err) => {
            callback(err);
        })
    },
    update : (values, num, email, callback) => {
        connection.query('update media set ? where num = ? and email = ?', [values, num, email], (err) => {
            callback(err);
        })
    },
    select : (qk, params, callback) => {
        connection.query(select[qk], params, (err, result) => {
            callback(err, result);
        })
    },
    delete : (num, email, callback) => {
        connection.query('delete from video where num = ? and email = ?', [num, email], (err, result) => {
            callback(err);
        })
    },
}

module.exports = DAO;
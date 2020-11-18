const DAO = {
    select : (email, callback) => {
        connection.query('select password_data from member where email = ?', email, (err, result) => {
            callback(err, result);
        })
    },
    delete: (id, callback) => {
        connection.query('delete from sessions where session_id = ?', id, (err) => {
            callback(err);
        })
    }
}

module.exports = DAO;
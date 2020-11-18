const DAO = {
    selectAll : (callback) => {
        connection.query('select * from member', (err, result) => {
            callback(err, result);
        })
    }
}


module.exports.DAO = DAO;
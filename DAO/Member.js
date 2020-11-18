const DAO = {
    activeInfo : (email, callback) => {
        const query = `select m.*, e.ev, a.ab from 
        (select * from member_profile where email='${email}')m,
        (select count(*) ev from event where email='${email}')e, 
        (select count(*) ab  from abandoned where email = '${email}')a;`;
        connection.query(query, (err, result) => {
            callback(err, result);
        })
    },
    updateNickname : (nickname, email, callback) => {
        connection.query('update member_profile set nickname = ? where email = ?', [nickname, email], (err) =>{
            callback(err);
        })
    },
    selectMyEvent : (email, callback) => {
        connection.query('select * from event where email = ?', email, (err, result) =>{
            callback(err, result);
        })
    },
    selectMyAbandoned :(email, callback) => {
        connection.query('select * from abandoned where email = ?', email, (err, result) =>{
            callback(err, result);
        })
    },
    updateImage : (img, email, callback) => {
        connection.query('update member_profile set img = ? where email = ?', [img, email], (err) => {
            callback(err);
        })
    }
}

module.exports = DAO;
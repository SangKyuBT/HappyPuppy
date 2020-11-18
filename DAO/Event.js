const selectBase = "select * from event where date(ev_start_date) ";
const selectQuery = (start, end) => {
    let str = '';
    if(!end){
        str = `>= '${start}' or date(ev_end_date) 
        >= '${start}' order by date(ev_start_date) asc`;
    }else{
        str = `between '${start}' and '${end}' 
        or date(ev_end_date) between '${start}' and '${end}'`
    }
    return selectBase + str;
}

const DAO = {
    insert : (form, callback) => {
        connection.query('insert into event set ? ', form, (err) => {
            callback(err);
        })
    },
    select : (start, end, callback) => {
        connection.query(selectQuery(start, end), (err, result) => {
            callback(err, result);
        })
    },
    update : (form, num, email, callback) => {
        connection.query('update event set ? where num = ? and email = ?', [form, num, email], (err) => {
            callback(err);
        })
    },
    delete : (num, email, callback) => {
        connection.query('delete from event where num = ? and email = ?', [num, email], (err, result) => {
            callback(err, result);
        })
    }
}

module.exports = DAO;
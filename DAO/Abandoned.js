const select = (place, num) => {
    if(!!place){
        return `select num, ad_title, ad_place, 
                main_img from abandoned where ad_place like '%${place}%'`;
    }
    if(!!num){
        return `select * from abandoned where num = ${num}`;
    }
    return 'select num, ad_title, ad_place, main_img from abandoned';
};
const DAO = {
    insert : (ab_info, callback) => {
        connection.query('insert into abandoned set ?', ab_info, (err) => {
            callback(err);
         })
    },
    update : (ab_info, num, callback) => {
        connection.query('update abandoned set ? where num = ?', [ab_info, num], (err, result) => {
            callback(err, result);
        })
    },
    select : (place, num, callback) =>{
        connection.query(select(place, num), (err, result) => {
            callback(err, result);
        })
    },
    delete : (num, email, callback) =>{
        connection.query('delete from abandoned where num = ? and email = ?', [num, email], (err) => {
            callback(err);
        })
    },
};

module.exports = DAO;
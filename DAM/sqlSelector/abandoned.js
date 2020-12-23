const select = (place, num) => {
    if(!!place){
        return `select num, poster_img from abandoned where ad_place like '%${place}%'`;
    }
    if(!!num){
        return `select * from abandoned where num = ${num}`;
    }
    return 'select num, ad_title, ad_place, poster_img from abandoned';
};
const insert = "insert into abandoned set ?";
const update = "update abandoned set ? where num = ?";
const _delete = "delete from abandoned where num = ? and email = ?";

module.exports = { select, insert, update, _delete };
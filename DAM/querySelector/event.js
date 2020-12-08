const selectBase = "select * from event where date(ev_start_date) ";
const select = (start, end) => {
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

const insert = "insert into event set ?";
const update = "update event set ? where num = ? and email = ?";
const _delete = "delete from event where num = ? and email = ?";

module.exports = {
    select, insert, update, _delete
};
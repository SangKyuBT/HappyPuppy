const insert = {
    "pass_find" : `insert into pass_find set ?`,
}
const update = {
    "member" : `update member set ? where email = ?`,
    "nickname" : `update member_profile set nickname = ? where email = ?`,
    "profile_img" : `update member_profile set img = ? where email = ?`,
}
const select = {
    "pass_find" : `select certify_number from pass_find 
                where certify_number = ? and wait_email = ?`,
    "member" : `select count(email) as count from member where email = ?`,
    "active_info" : `select m.*, count(ab.num) ab from   
                    (select mp.*, count(ev.num) ev  from member_profile mp   
                    left outer join event ev on ev.email = mp.email group by mp.num)m  
                    left outer join abandoned ab  on ab.email = m.email   
                    group by m.num having m.email = ?`,
    "channel_info" : `select mm.*, count(case when mt.think = 1 then 1 end) as good,   
                     count(case when mt.think = 0 then 1 end) as bad from   
                     (select m.num, m.email, sum(m.count) as mc, count(sc.channel_email) as sc  from media m   
                     left outer join script_list sc on m.email = sc.channel_email group by m.num)mm   
                     left outer join media_think mt on mm.num = mt.num   
                     group by mm.num having mm.email = ?`,
    "my_events" : `select * from event where email = ?`,
    "my_abandoneds" : `select * from abandoned where email = ?`,
    "my_comments" : `select c.*, mp.nickname, mp.img from comments c   
                    left outer join member_profile mp on c.email = mp.email   
                    where c.m_target in (?) order by c.date desc`,
    "my_comments" : `select cc.*, mp.nickname, mp.img  from   
                    (select c.*, count(case when ct.think = 1 then 1 end) as good,    
                    count(case when ct.think = 0 then 0 end) as bad from comments c    
                    left outer join comments_think ct on c.num =  ct.num group by c.num)cc    
                    left outer join member_profile mp on cc.email = mp.email where cc.m_target in (?) order by cc.date`, 
    "my_medias" : `select m.*, count(case when mt.think = 1 then 1 end) as good,  
                  count(case when mt.think = 0 then 1 end) as bad  
                  from media m left outer join media_think mt on mt.num = m.num  
                  group by m.num having m.email = ? order by m.date desc`,               
}
const _delete = {
    "pass_find" : `delete from pass_find where wait_email = ?`,
}

module.exports = {
    select, update, _delete, insert
};
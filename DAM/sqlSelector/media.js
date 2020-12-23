const select = {
    "member" : `select email, nickname, img from member_profile where email = ?`,
    "channel" : `select d.*, b.nickname, b.img as p_img, c.sl from
                (select media.*, count(case when media_think.think = 1 then 1 end) as good,
                count(case when media_think.think = 0 then 1 end) as bad from media 
                left outer join media_think on media.num = media_think.num 
                where media.email = ? group by media.num )d,
                (select nickname, img from member_profile where email = ?)b,
                (select count(*) sl from script_list where channel_email = ?)c
                order by d.date desc`,
    "profile" : `select email, nickname, img from member_profile where email = ?`,
    "script" : `select count(*) as count from script_list where channel_email = ?`,
    "my_script" : `select count(*) as count from script_list where channel_email = ? and member_email = ?`,
    "m_count" : `select m.m_count, s.sc_whether, c.ch_count from 
                (select count(*) as m_count from comments where m_target = ? and c_target is null)m,
                (select count(*) as sc_whether from script_list where channel_email = ? and member_email = ?)s,
                (select count(channel_email) as ch_count from script_list where channel_email = ?)c`,
    "all_comments" : `select a.*, member_profile.nickname, member_profile.img from   
                    (select aa.*, member_profile.nickname as rn from   
                    (select c.*, count(case when comments_think.think = 1 then 1 end) as good,   
                    count(case when comments_think.think = 0 then 1 end) as bad  
                    from comments c left outer join comments_think on c.num = comments_think.num  
                    where c.m_target = ? group by c.num)aa  
                    left outer join member_profile on aa.reply = member_profile.email)a 
                    left outer join member_profile on a.email = member_profile.email  
                    order by a.date desc`,
    "my_media_think" : `select * from media_think where num = ? and email = ?`,
    "my_comments_think" : `select * from comments_think where num =? and email = ?`,
    "media_counting" : `select * from media_view where num = ? and ip = ? and email = ?`,
    "media_counting_notemail" : `select * from media_view where num = ? and ip = ? and email is null`,
    "All" : `select mm.*, p.nickname, p.img as p_img  from   
            (select m.*, count(case when th.think=1 then 1 end) as good,   
            count(case when th.think=0 then 1 end) as bad from media m left outer join media_think th on m.num = th.num   
            group by m.num)mm left outer join member_profile p on mm.email = p.email   
            order by mm.date desc`,
    "media_view" : `select num from media_view where date between ? and ?`,
    "script_list" : `select ch.channel_email as email, m.nickname, m.img as p_img from script_list ch  
                    left outer join member_profile m on m.email = ch.channel_email  
                    where ch.member_email = ?`,
    "script_medias" : `select m.*, count(case when mt.think = 1 then 1 end) as good,   
                    count(case when mt.think = 0 then 1 end) as bad from  
                    media m left outer join media_think mt on m.num = mt.num  
                    where m.email in (?)  
                    group by m.num order by m.date desc`,
    "my_good" : `select mm.*, p.nickname, p.img as p_img  from 
                (select m.*, count(case when th.think=1 then 1 end) as good, count(case when th.think=0 then 1 end) as bad from media m 
                inner join media_think th on m.num = th.num and th.email = ?  
                group by m.num)mm 
                left outer join member_profile p on mm.email = p.email 
                order by mm.date desc`,
    "keyword_media" : `select m.*, p.nickname, p.img as p_img from   
                (select media.*, count(case when th.think = 1 then 1 end) as good, count(case when th.think = 0 then 1 end) as bad   
                from media left outer join media_think th on th.num = media.num  
                where media.tag regexp ? or media.title regexp ? or media.content regexp ?  
                group by media.num)m left outer join member_profile p on p.email = m.email   
                order by m.date desc`,
    "keyword_channel" : `select m.*, count(s.channel_email) as script_count from (  
                        select * from member_profile where email regexp ? or nickname regexp ?)m  
                        left outer join script_list s on m.email = s.channel_email group by m.num `,
    "media" : `select * from media where num = ?`,
    "comments" : `select distinct email from media    
                 where num in ((select distinct m_target from   
                 comments where num in (?)))`
                        
}
const insert = {
    "media" : `insert into media set ?`,
    "script" : `insert into script_list set ?`,
    "comment" : `insert into comments set ?`,
    "my_media_think" : `insert into media_think set ?`,
    "my_comments_think" : `insert into comments_think set ?`,
    "media_counting" : `insert into media_view set ?`
}
const update = {
    "media" : `update media set ? where num = ?`,
    "my_media_think" : `update media_think set ? where num =? and email = ?`,
    "my_comments_think" : `update comments_think set ? where num =? and email = ?`,
    "media_counting" : `update media_view set ? where num = ? and ip = ? and email = ?`,
    "media_counting_notemail" : `update media_view set ? where num = ? and ip = ? and email is null`,
    "media_upcount" : `update media set count = count + 1 where num = ?`
}

const _delete = {
    "script" : `delete from script_list where channel_email = ? and member_email = ?`,
    "media" : `delete from media where num = ?`,
    "my_media_think" : `delete from media_think where num = ? and email = email`,
    "my_comments_think" : `delete from comments_think where num = ? and email = email`,
    "comments" : `delete from comments where num in (?)`
}

module.exports = {
    select, insert, update, _delete
};
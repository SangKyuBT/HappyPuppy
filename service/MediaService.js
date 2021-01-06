/*
 미디어 서비스
 미디어와 채널 및 댓글 정보 응답, 
 영상 스트림 응답, 구독 관련
*/
import DAM from "../DAM/MediaDAM"; //데이터베이스 엑세스 모듈
import { practice } from "../modules/S3"; //S3 모듈
import { sort } from "../modules/MediaSort"; //미디어 조건에 따른 정렬

class Service {
    /*
     영상 S3 스트림 응답
     @param key(string) : 영상 이름
     @param range(string) : 요청 영상 범위
    */
    getVideo(key, range, callback){
        practice.headRead(key, (err, data) => {
            if(err){
                console.error('error is get video s3 head read');
                callback(err);
                return
            }
            const total = data.ContentLength, 
            item = range.split('=')[1].split('-'),
            start = Number(item[0]),
            j = Number(item[1]),
            end = j ? j : total - 1, 
            content_rength = (end - start) + 1; 

            const header = { 
                'AcceptRanges': 'bytes',
                'Content-Range' : "bytes " + start + "-" + end + "/" + total,
                'Content-Length' : content_rength,
                'Content-Type' : 'video/mp4',
            }
            const stream = practice.rangeStream(key, range);
            callback(err, stream, header);
        })
    };

    /*
     해당 채널의 정보 응답
     @param email(string) : 대상 이메일
     @param session_email(email) : 회원 자신의 채널인지 아닌지 구별
    */
    getChannel(email, session_email, callback){
        DAM.select('member', email, (err, result) => {
            if(err || result.length === 0){
                !err || console.error(err);
                callback(err, false, result);
                return;
            }
            let channel = {
                member_profile : result[0]
            }; 
            
            DAM.select('channel', [email, email, email], (err, result) => {
                if(err){
                    console.error('error is mysql select, get channel');
                    callback(err, true, result);
                    return;
                }
                channel.first_media = result[0];
                channel.medias = sort(result);
                channel.script_list = result;
                DAM.select('my_script',[email, session_email], (err, result) => {
                    if(err){
                        console.error('error is mysql select, get my script');
                    }
                    channel.this_script = result;
                    callback(err, true, channel);
                })
            })
        })
    };

    /*
     구독 정보 추가
     @param email(string) : 대상 이메일
     @param my_email(string) : 회원 이메일
    */
    scripting(email, my_email, callback){
        DAM.insert('script', {channel_email:email, member_email:my_email}, (err) => {
            if(err){
                console.error('error is mysql insert script list');
            }
            callback(err);
        })
    };

    /*
     구독 정보 삭제
     @param email(string) : 대상 이메일
     @param my_email(string) : 회원 이메일
    */
    unscripting(email, my_email, callback){
        DAM.delete('script', [email, my_email], (err) => {
            if(err){
                console.error('error is mysql insert script list');
            }
            callback(err);
        })
    }

    /*
     미디어 댓글 갯수, 사용자 프로필 정보 응답
     @param num(number) : 미디어 번호
     @param email(string) : 대상 이메일
     @param s_email(string) : Authorization 이메일
    */
    getMCCount(num, email, s_email, callback){
        DAM.select('m_count', [num, email, s_email, email], (err, result) => {
            if(err){
                console.error('error is mysql select media comment count');
            }
            const rs = result;
            DAM.select('profile', [s_email], (err, result) => {
                if(err){
                    console.error('error is mysql selectmedia profile');
                }
                callback(err, rs, result[0]);
            })
        })
    };
    
    /*
     미디어의 댓글정보 응답
     @param num(number) : 미디어 번호
    */
    getComments(num, callback){
        DAM.select('all_comments', [num], (err, result) => {
            if(err){
                console.error('error is mysql select comments');
                console.error(err);
            }
            var comments = result;
            var datas = [];
            for(let i = 0; i < comments.length; i++){
                if(!comments[i].c_target){
                    datas.push(comments[i]);
                }
            }
            for(let i = 0; i < datas.length; i++){
                datas[i].c_comments = [];
                for(let j = 0; j < comments.length; j++){
                    if(datas[i].num === comments[j].c_target){
                        datas[i].c_comments.push(comments[j]);
                    }
                }
            }
            callback(err, datas);
        })
    };
    
    /*
     댓글 추가
     @param params(obj) : 댓글 정보 객체
     @param email(string) : 
    */
    insertComment(params, email, callback){
        params.email = email;
        params.date = new Date();
        DAM.insert('comment', params, (err) => {
            !err || console.error('error is mysql insert comment');
            callback(err);
        })
    };
    
    /*
     댓글 혹은 미디어 좋아요 싫어요
     @param key(boolean) : 대상 테이블이 댓글이냐 미디어냐를 구분
     @param email(string) : Authorization 이메일
     @param params(obj) : 좋아요 or 싫어요 정보 객체
    */
    setThink(key, email, params, callback){
        const qk = key ? 'my_media_think' : 'my_comments_think';
        DAM.select(qk, [params.num, email], (err, result) =>{
            if(err){
                console.error('error is mysql select to my media think ');
                callback(err);
                return
            }
            let value = {};
            if(result.length > 0){
                if(result[0].think === Number(params.think)){
                    DAM.delete(qk, [params.num, email], (err)=>{
                        !err || console.error(`erro is mysql delete to ${qk}`);
                        callback(err, 3);
                    })
                }else{
                    value.think = params.think;
                    DAM.update(qk, [value, params.num, result[0].email], (err) => {
                        !err || console.error(`error is mysql update to ${qk}`);
                        callback(err, 4);
                    })
                }
            }else{
                value = {
                    num : params.num,
                    email : email,
                    think : params.think
                }
                DAM.insert(qk, value, (err) => {
                    !err || console.error(`error is mysql insert to ${qk}`);
                    callback(err, 1);
                })
            }
        })
    };

    /*
     조회수 증가 조건 검사 후 조회수 증가
     @param num(number) : 미디어 번호
     @param ip(string) : 사용자 ip
     @param email(string) : 세션 이메일
    */
    mediaCounting(num, ip, email, callback){
        let qk = 'media_counting_notemail'
        let values = [num, ip];
        if(!!email){
            qk = 'media_counting';
            values[2] = email;
        }
        DAM.select(qk, values, (err, result) => {
            if(err){
                console.error('error is mysql select to media counting');
                callback(err);
                return
            }
            let check = false;
            let now_date = new Date();
            if(result.length > 0){
                let code = 3;
                for(let i = 0; i < result.length; i++){
                    if(now_date - new Date(result[i].date) > 300000){
                        check = true;
                        break;
                    }
                }
                if(check){
                    code = 1;
                    values.unshift({date : now_date});
                    DAM.update(qk, values, (err) => {
                        !err || console.error('error is mysql update to media counting');
                        callback(err, code);
                    })
                    DAM.update('media_upcount', [num], (err) => {
                        !err || console.error(err);
                    })
                }else{
                    callback(err, code);
                }
            }else{
                const values = {
                    num : num,
                    ip : ip,
                    email : email,
                    date : now_date,
                }
                DAM.insert('media_counting', values, (err) => {
                    !err || console.error('error is mysql insert to media counting');
                    callback(err, 1);
                })
                DAM.update('media_upcount', [num], (err) => {
                    !err || console.error(err);
                })
            }

        })
    };
    
    /*
     홈 미디어 응답
     @param list(array) : 구독자 배열
    */
    getHomeMedias(list, callback){
        let home_medias;
        DAM.select('All', (err, result) => {
            if(err){
                console.error('error is mysql select to home');
                callback(err);
                return;
            }
            if(!Array.isArray(list) || !list.length){
                home_medias = sort(result);
                callback(err, home_medias);
                return
            }else{
                for(let i = 0; i < list.length; i++){
                    for(let j = 0; j < result.length; j ++){
                        if(list[i].email === result[j].email){
                            result.scb = true;
                        }
                    }
                }
                home_medias = sort(result);
            }
            callback(err, home_medias);
        })
    };
    
    /*
     회원 구독 정보 요청
     @param email(string) : 세션 이메일
    */
    getMyscript(email, callback){
        if(!email){
            callback(false, []);
            return;
        }
        DAM.select('script_list', [email], (err, result) => {
            !err || console.error(err);
            callback(err, result);
        })
    };
 
    /*
     조건에 따라 인기 미디어 응답 
     @조건 : 주간 조회수, 최근, 카테고리
    */
    getPopMedias(callback){
        let rs = {
            recently : null,
            pop : null,
            daily : [],
            education : [],
        }
        DAM.select('All', (err, recently) => {
            if(err){
                console.error('error is mysql select to All');
                callback(err);
                return
            }
            rs.recently = recently;
            DAM.select('media_view', [new Date(Date.now() - 86400000), new Date()], (err, pop) => {
                if(err){
                    console.error('error is mysql to media_view');
                    callback(err);
                    return
                }
                for(let i = 0; i < pop.length; i++){
                    for(let j = 0; j < recently.length; j++){
                        if(pop[i].num === recently[j].num){
                            if(!recently[j].pop){
                                recently[j].pop = 1;
                            }else{
                                recently[j].pop ++;
                            }
                        }
                    }
                }
                rs.pop = sort(recently);
                for(let i = 0; i<rs.pop.length; i++){
                    if(rs.pop[i].category === '일상'){
                        rs.daily.push(rs.pop[i]);
                    }else if(rs.pop[i].category === '교육'){
                        rs.education.push(rs.pop[i]);
                    }
                }
                callback(err, rs);
            })
        })
    };
    
    /*
     구독자 미디어 정보 응답
     @param list(array) : 구독자 배열
    */
    getScriptMedias(list, callback){
        let in_arr = [];
        let rs_obj = {};
        for(let i = 0; i < list.length; i++){
            in_arr[i] = list[i].email;
            rs_obj[list[i].email] = [];
        }
        DAM.select('script_medias', [in_arr], (err, result) => {
            if(err) {
                console.error('error is mysql select to set script medias');
                callback(err);
                return;
            }
            rs_obj.all = result;
            for(let i = 0; i < list.length; i++){
                for(let j = 0; j < result.length; j++){
                    if(list[i].email === result[j].email){
                        result[j].nickname = list[i].nickname; 
                        result[j].p_img = list[i].p_img;
                        rs_obj[list[i].email].push(result[j]);
                    }
                }
            }
            callback(err, rs_obj);
        })
    };

    /*
     좋아요를 표시한 미디어 응답
     @param email(string) : 세션 이메일
    */
    getMyGoodMedias(email, callback){
        DAM.select('my_good', [email], (err, result) => {
            !err || console.error('error is mysql select to get my good medias');
            callback(err, result);
        })
    };

    /*
     키워드에 일치하는 미디어 및 채널 응답
     @param keyword(string) : 검색 키워드
    */
    searchKeyword(keyword, callback){
        const arr = keyword.split(' ');
        let keywords = [];
        for(let i = 0; i < arr.length; i++){
            !arr[i] || keywords.push(arr[i]); 
        }
        keywords.push(keyword);
        const params = keywords.join('|');
        let rs = {
            channels : null,
            medias : null,
        }
        DAM.select('keyword_media', [params, params, params], (err, result) => {
            if(err){
                console.error('error is mysql select to keyword media');
                callback(err);
                return;
            }
            rs.medias = !result.length ? null : sort(result);
            DAM.select('keyword_channel', [params, params], (err, result) => {
                if(err){
                    console.error('error is mysql select to keyword channel');
                    callback(err);
                    return;
                }
                rs.channels = !result.length ? null : result;
                callback(err, rs);
            })
        })
    };

    /*
     미디어 삭제
     @param num(number) : 미디어 번호
     @param email(string) : Authorization 이메일
    */
    deleteMeida(num, email, callback){
        DAM.select('media', [num], (err, result) => {
            if(err || result.length < 1 || result[0].email !== email){
                !err || console.error(err);
                console.log('nonnormal request!')
                callback(true);
                return;
            }
            DAM.delete('media', [num], (err) => {
                !err || console.error(err);
                callback(err);
                return;
            })
        })
    };

    /*
     댓글 삭제
     @param num(number) : 댓글 번호
     @param email(string) : Authorization 이메일
    */
    deleteComments(num, email, callback){
        DAM.select('comments', [num], (err, result) => {
            if(err){
                console.error(err);
                callback(err);
            }else if(result.length > 1 || result[0].email !== email){
                console.log('nonnormal request!');
                callback(true);
            }else{
                DAM.delete('comments', [num], (err) => {
                    !err || console.error(err);
                    callback(err);
                })
            }
        })
    };

    /*
     미디어 업로드
     @param form(obj) : 영상 정보 문자열 객체
     @param files(obj) : 이미지, 비디오 정보 객체
     @param email(string) : 세션 이메일
    */
    mediaUpload(form, files, email, callback){
        form = JSON.parse(form);
        form.email = email,
        form.img = files.img[0].key,
        form.video = files.video[0].key,
        form.date = new Date();
        const upload_keys = [];
        DAM.insert('media', form, (err) => {
            if(err){
                console.error(err);
                upload_keys[0]({Key : `media/${form.img}`});
                upload_keys[1]({Key : `media/${form.video}`});
                practice.deletes(upload_keys, (err) => {
                    !err || console.error(err);
                })
            }
            callback(err);
        })
    };

    /*
     미디어 수정
     @param form(obj) : 영상 정보 문자열 객체
     @param files(obj) : 이미지, 비디오 정보 객체
     @param email(string) : Authorization 이메일
    */
    mediaUpdate(form, files, num, email, callback){
        DAM.select('media', [num], (err, result) => {
            if(err || result.length < 1 || result[0].email !== email){
                !err || console.error(err);
                console.log('nonnormal request!');
                callback(err);
                return;
            }
            const old_media = result[0];
            const delete_keys = [];
            const upload_keys = [];

            form = JSON.parse(form);
            if(!!files.img){
                delete_keys.push({Key : `media/${old_media.img}`});
                upload_keys.push({Key : `media/${files.img[0].key}`});
            }
            if(!!files.video){
                delete_keys.push({Key : `media/${old_media.video}`});
                upload_keys.push({Key : `media/${files.video[0].key}`});
            }
            
            DAM.update('media', [form, old_media.num], (err) => {
                let _delete = null;
                if(err){
                    console.error(err);
                    _delete = upload_keys;
                }else if(delete_keys.length > 0){
                    _delete = delete_keys;
                }
                callback(err);
                if(!!_delete){
                    practice.deletes(_delete, (err) => {
                        !err || console.error(err);
                    })
                }
            });
        })
    };
};

module.exports = new Service();
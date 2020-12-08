const DAM = require('../DAM/Media');
const { practice } = require('../modules/S3');
const { sort } = require('../modules/MediaSort');

const service = {
    //해당 채널의 정보들을 가져와서 클라이언트에게 전송
    getChannel : (email, session_email, callback) => {
        DAM.select('member', email, (err, result) => {
            if(err || result.length === 0){
                console.error('error is mysql select, get channel(member)');
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
                // sort(result);
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
    },
    //구독
    scripting : (email, my_email, callback) => {
        DAM.insert('script', {channel_email:email, member_email:my_email}, (err) => {
            if(err){
                console.error('error is mysql insert script list');
            }
            callback(err);
        })
    },
    //구독 취소
    unscripting : (email, my_email, callback) => {
        DAM.delete('script', [email, my_email], (err) => {
            if(err){
                console.error('error is mysql insert script list');
            }
            callback(err);
        })
    },
    //해당 영상의 영상 댓글 갯수와 사용자, 프로필 정보
    getMCCount : (num, email, s_email, callback) => {
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
    },
    //해당 영상 번호의 모든 댓글
    getComments: (num, callback) => {
        DAM.select('all_comments', [num], (err, result) => {
            if(err){
                console.error('error is mysql select comments');
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
    },
    //댓글 insert
    insertComment : (params, email, callback) => {
        params.email = email;
        params.date = new Date();
        DAM.insert('comment', params, (err) => {
            !err || console.error('error is mysql insert comment');
            callback(err);
        })
    },
    //댓글 좋아요 or 싫어요
    setThink : (key, email, params, callback) => {
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
    },
    //조건에 따른 조회수 증가
    //조건 = ip, email, time
    mediaCounting : (num, ip, email, callback) => {
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
                        console.log('update!!')
                    })
                }
                callback(err, code);
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
                    !err || console.error('error is mysql update to media count up');
                })
            }
        })
    },
    //홈 미디어 응답
    //로그인 상태라면 정렬 조건에 구독 점수 추가
    getHomeMedias : (list, callback) => {
        let home_medias;
        DAM.select('All', (err, result) => {
            if(err){
                console.error('error is mysql select to home');
                callback(err);
                return;
            }
            if(!list.length){
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
    },
    //회원 구독 정보 응답
    getMyscript : (email, callback) => {
        if(!email){
            callback(false, []);
            return;
        }
        DAM.select('script_list', [email], (err, result) => {
            !err || console.error(err);
            callback(err, result);
        })
    },
    //인기 미디어 응답
    //정렬 조건 : 주간 조회수, 최근, 카테고리
    getPopMedias : (callback) => {
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
                    for(let j = 0; j<recently.length; j++){
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
    },
    //구독자 미디어 응답
    getScriptMedias : (list, callback) => {
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
    },
    getMyGoodMedias : (email, callback) => {
        DAM.select('my_good', [email], (err, result) => {
            !err || console.error('error is mysql select to get my good medias');
            console.log(result);
            callback(err, result);
        })
    },
    searchKeyword: (keyword, callback) => {
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
                console.log(rs)
                callback(err, rs);
            })
        })
    },
    deleteMeida : (num, email, callback) => {
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
    },
    deleteComments : (num, email, callback) => {
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
    },
    //media upload
    mediaUpload : (form, files, email, callback) => {
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
    },

    mediaUpdate : (form, files, num, email, callback) => {
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
                console.log(result[0]);
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
    },
    //비디오 스트리밍
    //**1. s3에서 오브젝트의 정보만을 가져옴
    //**2. 받아온 정보들로 헤더에 들어갈 객체 생성(영상 시작, 끝, 총 길이, 재생 길이)
    //**3. s3에서 stream 호출
    //**4. 스트림과 헤더를 callback에 전송
    getVideo : (key, range, callback)=>{
        /**1 */
        practice.headRead(key, (err, data) => {
            if(err){
                console.error('error is get video s3 head read');
                callback(err);
                return
            }
            /**2 */
            const total = data.ContentLength, //영상의 전체 용량
            //받아온 range에서 영상 시작과 끝 범위를 추출
            item = range.split('=')[1].split('-');
            start = Number(item[0]); //영상 시작
            j = Number(item[1]);
            end = j ? j : total - 1; //영상 끝
            content_rength = (end - start) + 1; //재생 길이
            const header = { //헤더에 들어갈 객체
                'AcceptRanges': 'bytes',
                'Content-Range' : "bytes " + start + "-" + end + "/" + total,
                'Content-Length' : content_rength,
                'Content-Type' : 'video/mp4',
            }
            /**3 */
            const stream = practice.rangeStream(key, range);
            stream.on('error', function(err){
                console.log(err.message);
                return;
            }).on('end', function(){
                console.log('end straming');
                return;
            }).on('close', function(){
                console.log('close straming');
                return;
            })
            /**4 */
            callback(err, stream, header);
        })
    }
    
}

module.exports.service = service;
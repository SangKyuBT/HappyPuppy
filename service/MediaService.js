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
    async getVideo(key, range){
        try{
            const data = await practice.headRead(key);
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
            return {stream, header};

        }catch(err){
            console.error(err);
            throw new Error(err);         
        }
    };

    /*
     해당 채널의 정보 응답
     @param email(string) : 대상 이메일
     @param session_email(email) : 회원 자신의 채널인지 아닌지 구별
    */
    async getChannel(email, session_email){
        let check = true, result = false;
        try{
            const member = await DAM.select('member', email);
            if(!member.length){
                throw new Error(`channel is not find : ${email}`);
            }
            let channel = {member_profile : member[0]};
            const _channel = await DAM.select('channel', [email, email, email]);
            channel.first_media = _channel[0];
            channel.medias = sort(_channel);
            channel.script_list = _channel;
            const my_sc = await DAM.select('my_script', [email, session_email]);
            channel.this_script = my_sc;
            result = channel;
        }catch(err){
            console.error(err); 
            check = false;          
        }finally{
            return {check, result};
        }

    };

    /*
     구독 정보 추가
     @param email(string) : 대상 이메일
     @param my_email(string) : 회원 이메일
    */
    async scripting(email, my_email){
        try{
            await DAM.insert('script', {channel_email:email, member_email:my_email});
            return true;
        }catch(err){
            console.error(err);
            return false;
        }

    };

    /*
     구독 정보 삭제
     @param email(string) : 대상 이메일
     @param my_email(string) : 회원 이메일
    */
    async unscripting(email, my_email){
        try{
            await DAM.delete('script', [email, my_email]);
            return true;
        }catch(err){
            console.error(err);
            return false;
        }
    }

    /*
     미디어 댓글 갯수, 사용자 프로필 정보 응답
     @param num(number) : 미디어 번호
     @param email(string) : 대상 이메일
     @param s_email(string) : Authorization 이메일
    */
    async getMCCount(num, email, s_email){
        let comments, my_info, err;
        try{
            comments = await DAM.select('m_count', [num, email, s_email, email]);
            my_info = await DAM.select('profile', [s_email]);
        }catch(e){
            console.error(e);
            err = e;
        }finally{
            return {err, comments, my_info}
        }
    };
    
    /*
     미디어의 댓글정보 응답
     @param num(number) : 미디어 번호
    */
    async getComments(num){
        var datas = false;
        try{
            const comments = await DAM.select('all_comments', [num]);
            datas = [];
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
        }catch(err){
            console.error(err);
        }finally{
            return datas;
        }
    };
    
    /*
     댓글 추가
     @param params(obj) : 댓글 정보 객체
     @param email(string) : 
    */
    async insertComment(params, email){
        params.email = email;
        params.date = new Date();
        let result = false;
        try{
            result = await DAM.insert('comment', params);
        }catch(err){
            console.error(err);
        }finally{
            return result;
        }
    };
    
    /*
     댓글 혹은 미디어 좋아요 싫어요
     @param key(boolean) : 대상 테이블이 댓글이냐 미디어냐를 구분
     @param email(string) : Authorization 이메일
     @param params(obj) : 좋아요 or 싫어요 정보 객체
    */
    async setThink(key, email, params){
        const qk = key ? 'my_media_think' : 'my_comments_think';
        let err, code;
        try{
            const think = await DAM.select(qk, [params.num, email]);
            let value = {};
            if(think.length > 0){
                if(think[0].think === Number(params.think)){
                    await DAM.delete(qk, [params.num, email]);
                    code = 3;
                }else{
                    value.think = params.think;
                    await DAM.update(qk, [value, params.num, think[0].email]);
                    code = 4;
                }
            }else{
                value = {
                    num : params.num,
                    email : email,
                    think : params.think
                }
                await DAM.insert(qk, value);
                code = 1;
            }
        }catch(e){
            console.error(e);
            err = e;
        }finally{
            return {err, code};
        }
    };

    /*
     조회수 증가 조건 검사 후 조회수 증가
     @param num(number) : 미디어 번호
     @param ip(string) : 사용자 ip
     @param email(string) : 세션 이메일
    */
    async mediaCounting(num, ip, email){
        let qk = 'media_counting_notemail', values = [num, ip], code, err;
        if(!!email){
            qk = 'media_counting';
            values[2] = email;
        }
        try{
            const result = await DAM.select(qk, values);
            let check = false, now_date = new Date();
            if(result.length > 0){
                code = 3;
                for(let i = 0; i < result.length; i++){
                    if(now_date - new Date(result[i].date) > 300000){
                        check = true;
                        break;
                    }
                }
                if(check){
                    code = 1;
                    values.unshift({date : now_date});
                    await DAM.update(qk, values);
                }
            }else{
                code = 1;
                const values = {
                    num : num,
                    ip : ip,
                    email : email,
                    date : now_date,
                }
                await DAM.insert('media_counting', values);
            }
        }catch(e){
            console.err(e);
            err = e;
        }finally{
            try{
                !err || DAM.update('media_upcount', [num]);
            }catch(err){
                console.error(err);
            }
            return {err, code};
        }
    };
    
    /*
     홈 미디어 응답
     @param list(array) : 구독자 배열
    */
    async getHomeMedias(list){
        var home_medias = false;
        try{
            const result = await DAM.select('All');
            if(!Array.isArray(list) || !list.length){
                home_medias = sort(result);
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
        }catch(e){
            console.error(e);
        }finally{
            return home_medias;
        }
    };
    
    /*
     회원 구독 정보 요청
     @param email(string) : 세션 이메일
    */
    async getMyscript(email){
        if(!email){
            return false;
        }

        try{
            const result = await DAM.select('script_list', [email]);
            return result;
        }catch(err){
            console.error(err);
            return false;
        }
    };
 
    /*
     조건에 따라 인기 미디어 응답 
     @조건 : 주간 조회수, 최근, 카테고리
    */
    async getPopMedias(){
        let rs = {
            recently : null,
            pop : null,
            daily : [],
            education : [],
        };
        let err;
        try{
            const recently = await DAM.select('All');
            rs.recently = recently;
            const pop = await  DAM.select('media_view', [new Date(Date.now() - 86400000), new Date()]);
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
        }catch(e){
            console.error(e);
            err = e;
        }finally{
            return {err, rs};
        }
    };
    
    /*
     구독자 미디어 정보 응답
     @param list(array) : 구독자 배열
    */
    async getScriptMedias(list){
        let in_arr = [], rs_obj = {}, err;
        for(let i = 0; i < list.length; i++){
            in_arr[i] = list[i].email;
            rs_obj[list[i].email] = [];
        }
        try{
            const result = await DAM.select('script_medias', [in_arr]);
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
        }catch(e){
            console.error(e);
            err = e;
        }finally{
            return {err, rs_obj};
        }
    };

    /*
     좋아요를 표시한 미디어 응답
     @param email(string) : 세션 이메일
    */
    async getMyGoodMedias(email){
        try{
            const result = await  DAM.select('my_good', [email]);
            return result;
        }catch(e){
            console.error(e);
            return false;
        }
    };

    /*
     키워드에 일치하는 미디어 및 채널 응답
     @param keyword(string) : 검색 키워드
    */
    async searchKeyword(keyword){
        const arr = keyword.split(' ');
        let keywords = [], err; 
        for(let i = 0; i < arr.length; i++){
            !arr[i] || keywords.push(arr[i]); 
        }
        keywords.push(keyword);
        const params = keywords.join('|');
        let rs = {
            channels : null,
            medias : null,
        }
        try{
            const result = await DAM.select('keyword_media', [params, params, params]);
            rs.medias = !result.length ? null : sort(result);
            const _result = await DAM.select('keyword_channel', [params, params]);
            rs.channels = !_result.length ? null : _result;
        }catch(e){
            console.error(e);
            err = e;
        }finally{
            return {err, rs};
        }
    };

    /*
     미디어 삭제
     @param num(number) : 미디어 번호
     @param email(string) : Authorization 이메일
    */
    async deleteMeida(num, email){
        try{
            const result = await DAM.select('media', [num]);
            if(result.length < 1 || result[0].email !== email){
                throw new Error('nonnormal request!');
            }
            await DAM.delete('media', [num]);
            const arr = [`media/${form.img}`, `media/${form.video}`];
            try{
                practice.deletes(arr);
            }catch(err){
                console.error(err);
            }
            return true;
        }catch(e){
            console.error(e);
            return false;
        }
    };

    /*
     댓글 삭제
     @param num(number) : 댓글 번호
     @param email(string) : Authorization 이메일
    */
    async deleteComments(num, email){
        try{
            const result = await DAM.select('comments', [num]);
            if(result.length > 1 || result[0],email !== email){
                throw new Error('nonnormal request!');
            }
            await DAM.delete('comments', [num]);
            return true;
        }catch(err){
            console.error(err);
            return false;
        }
    };

    /*
     미디어 업로드
     @param form(obj) : 영상 정보 문자열 객체
     @param files(obj) : 이미지, 비디오 정보 객체
     @param email(string) : 세션 이메일
    */
    async mediaUpload(form, files, email){
        form = JSON.parse(form);
        form.email = email,
        form.img = files.img[0].key,
        form.video = files.video[0].key,
        form.date = new Date();
        const upload_keys = [];
        try{
            await DAM.insert('media', form);
            return true;
        }catch(err){
            console.error(err);
            upload_keys[0]({Key : `media/${form.img}`});
            upload_keys[1]({Key : `media/${form.video}`});
            try{
                await practice.deletes(upload_keys);
            }catch(err){
                console.error(err);
            }
            return false;
        }
    };

    /*
     미디어 수정
     @param form(obj) : 영상 정보 문자열 객체
     @param files(obj) : 이미지, 비디오 정보 객체
     @param email(string) : Authorization 이메일
    */
    async mediaUpdate(form, files, num, email){
        let _delete = null;
        const delete_keys = [];
        const upload_keys = [];
        try{
            const result = await DAM.select('media', [num]);
            if(result.length < 1 || result[0].email !== email){
                throw new Error({err_code : 0 , message : 'nonnormal request!'});
            }
            const old_media = result[0];
            form = JSON.parse(form);
            if(!!files.img){
                form.img = files.img[0].key;
                delete_keys.push({Key : `media/${old_media.img}`});
                upload_keys.push({Key : `media/${files.img[0].key}`});
            }
            if(!!files.video){
                form.video = files.video[0].key;
                delete_keys.push({Key : `media/${old_media.video}`});
                upload_keys.push({Key : `media/${files.video[0].key}`});
            }
            try{
                await DAM.update('media', [form, old_media.num]);
                _delete = delete_keys.length > 0 ? delete_keys : null;
            }catch(err){
                console.error(err);
                _delete = upload_keys;
            }
            return true;
        }catch(err){
            console.error(err);
            return false;
        }finally{
            if(!!_delete){
                try{
                    practice.deletes(_delete);
                }catch(err){
                    console.error(err);
                }
            }
        }
    };
};

module.exports = new Service();
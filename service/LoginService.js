/*
 로그인 서비스
 로그인, 네이버 로그인
*/
import DAM from "../DAM/LoginDAM"; //데이터베이스 엑세스 모듈
import createSecret from "../modules/CreateSecret"; //문자열 암호화 모듈
import createToken from "../modules/CreateToken"; //토큰 암호화 모듈
import naver from "../modules/NaverApi"; //네이버 로그인 모듈
import getEmail from "../modules/getEmail"; //로그인 루트에 따른 이메일 추출

class Service {
    /*
     로그인, 해당 이메일로 로그인 되있다면 대상 세션 로그아웃
     @param body(obj) : 로그인 이메일, 비밀번호
    */
    async loginService(body){
        const email = body.email;
        let session_delete = false;
        try{
            const member = await DAM.select('member', email);
            if(member.length === 0){
                return false;
            }

            const vp = JSON.parse(member[0].password_data);
            if(createSecret.ventriloquism(vp) === body.password){
                const sessions = await DAM.select('sessions', null);
                let data, session_email, session = false, sessions_id, access_token, i;
                for(i = 0; i < sessions.length; i++){
                    data = JSON.parse(sessions[i].data);
                    session_email = getEmail(data);
                    if(email === session_email){
                        session = true;
                        sessions_id = sessions[i].session_id;
                        access_token = data.islogined === 2 ? JSON.parse(data.tokens).access_token : null;
                        break;
                    }
                }

                const token = createToken.signToken(email);
                if(session){
                    session_delete = true;
                    await DAM.delete(sessions_id);
                    console.log(`${email} has deleted an existing session with a login request`);  
                    if(!!access_token){
                        naver.deleteToken(access_token, (err, res, body) => {
                            !err || res.statusCode === 200 || console.error('error is naver delete token');
                        })
                    }
                }
                return token;
            }else{
                return false;
            }
        }catch(err){
            const e = !session_delete ? err : `${email} attempted to delete an existing session due to a login request but failed`;
            console.error(e);
            return false;
        }
    };

    /*
     view route 위치가 포함된 네이버 로그인 url 응답
     @param path(string) : 네이버 로그인 요청시에 view route 위치
    */
    naverRedirect(path){
        let p = '/home'; 
        if(path.indexOf('/event') > -1){
            p = '/event'
        }else if(path.indexOf('/education') > -1){
            p = '/education'
        }else if(path.indexOf('/abandoned') > -1){
            p = '/abandonedDog'
        }
        
        const url = naver.hrefURL(p);
        // callback(url);
        return url;
    };

    /*
     네이버 로그인, 해당 이메일로 로그인 되있다면 대상 세션 로그아웃
     @param query(obj) : 로그인 정보 객체
    */
    naverLogin(query, callback){
        const option = naver.login(query);
        var request = require('request')
        request.post(option, (error, response, body) => {
            if(error || response.statusCode !== 200){
                console.error(`error is naver login ${response.statusCode}`);
                callback(err, response);
                return;
            }
            
            const body_obj = JSON.parse(body);
            naver.getInfo(body_obj.access_token, async (error, response, body) => {
                if(error || response.statusCode !== 200){
                    console.error(`error is naver get email ${response.statusCode}`);
                    callback(error, response);
                    return;
                }

                body = JSON.parse(body);
                const email = body.response.email;
                body_obj.email_token = createToken.signToken(email);
                delete body_obj.expires_in;
                const naver_res = response,
                tokens = JSON.stringify(body_obj);
                let session_delete = false; 
                try{
                    const sessions = await DAM.select('sessions', null);
                    let session_id = null;
                    for(let i = 0; i<sessions.length; i++){
                        data = JSON.parse(sessions[i].data);
                        session_email = getEmail(data);
                        if(email === session_email){
                            session_id = sessions[i].session_id;
                            break;
                        }
                    }

                    if(!!session_id){
                        await DAM.delete(session_id);
                        session_delete = true;
                        callback(false, naver_res, tokens);
                    }else{
                        const key = 'member_profile';
                        const profiles = await DAM.select(key, email);
                        if(profiles.length > 0){
                            callback(false, naver_res, tokens);
                        }else{
                            await DAM.insert(key, {email});
                            callback(false, naver_res, tokens);
                        }
                    }
                }catch(err){
                    const e = !session_delete ? err : 'delete existing session during naver login';
                    console.error(e);
                    callback(e);
                }
            })
        })
    };

    /*
     로그 아웃 요청
     @param id(string) : SessionId
    */
    async loginOut(id){
        try{
            await DAM.delete(id);
            return true;
        }catch(err){
            console.error(err);
            return false;
        }
    };
};

module.exports = new Service();

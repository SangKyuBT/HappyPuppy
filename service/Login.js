/*
 로그인 서비스
 로그인, 네이버 로그인
*/
const DAM = require('../DAM/Login');
const createSecret = require('../modules/CreateSecret'); //문자열 암호화 모듈
const createToken = require('../modules/CreateToken'); //토큰 암호화 모듈
const naver = require('../modules/NaverApi'); //네이버 로그인 모듈
const getEmail = require('../modules/getEmail'); //로그인 루트에 따른 이메일 추출

const service = {
    /*
     로그인, 해당 이메일로 로그인 되있다면 대상 세션 로그아웃
     @param body(obj) : 로그인 이메일, 비밀번호
    */
    loginService : (body, callback) => {
        const email = body.email;
        DAM.select('member', email, (err, result) => {
            if(err || result.length === 0){
                console.error('error is login, mysql select failed');
                callback(err, 0);
                return;
            }

            const vp = JSON.parse(result[0].password_data);
            if(createSecret.ventriloquism(vp) === body.password){
                DAM.select('sessions', null, (err, result) => {
                    if(err){
                        console.error('error is mysql select sessions');
                        callback(err, 0);
                        return
                    }

                    var data, session_email, session = false, sessions_id, access_token;
                    for(i = 0; i < result.length; i++){
                        data = JSON.parse(result[i].data);
                        session_email = getEmail(data);
                        if(email === session_email){
                            session = true;
                            sessions_id = result[i].session_id;
                            access_token = data.islogined === 2 ? JSON.parse(data.tokens).access_token : null;
                            break;
                        }
                    }

                    const token = createToken.signToken(email);
                    if(!session){
                        callback(err, 1, token);
                        return;
                    }
                    
                    DAM.delete(sessions_id, (err) => {
                        if(err){
                            console.error(`${email} attempted to delete an existing session due to a login request but failed`);
                            callback(err, 0)
                        }else{
                            console.log(`${email} has deleted an existing session with a login request`);
                            if(!!access_token){
                                naver.deleteToken(access_token, (err, res, body) => {
                                    !err || res.statusCode === 200 || console.error('error is naver delete token');
                                })
                            }
                            callback(err, 1, token);
                        }
                    })
                })
            }else{
                console.log(`${email} login failed`);
                callback(err, 0);
            }
        })
    },

    /*
     view route 위치가 포함된 네이버 로그인 url 응답
     @param path(string) : 네이버 로그인 요청시에 view route 위치
    */
    naverRedirect : (path, callback) => {
        let p = '/home'; 
        if(path.indexOf('/event') > -1){
            p = '/event'
        }else if(path.indexOf('/education') > -1){
            p = '/education'
        }else if(path.indexOf('/abandoned') > -1){
            p = '/abandoned'
        }
        
        const url = naver.hrefURL(p);
        callback(url);
    },

    /*
     네이버 로그인, 해당 이메일로 로그인 되있다면 대상 세션 로그아웃
     @param query(obj) : 로그인 정보 객체
    */
    naverLogin : (query, callback) => {
        const option = naver.login(query);
        var request = require('request')
        request.post(option, (error, response, body) => {
            if(error || response.statusCode !== 200){
                console.error(`error is naver login ${response.statusCode}`);
                callback(err, response);
                return;
            }
            
            const body_obj = JSON.parse(body);
            naver.getInfo(body_obj.access_token, (error, response, body) => {
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
                // callback(error, response, JSON.stringify(body_obj));
                DAM.select('sessions', null, (err, result) => {
                    if(err){
                        console.error(`error is naver to check sessions`);
                        callback(err, naver_res);
                        return
                    }

                    let session_id = null;
                    for(let i = 0; i<result.length; i++){
                        data = JSON.parse(result[i].data);
                        session_email = getEmail(data);
                        if(email === session_email){
                            session_id = result[i].session_id;
                            break;
                        }
                    }

                    if(!!session_id){
                        DAM.delete(session_id, (err) => {
                            !err || console.error('delete existing session during naver login');
                            callback(err, naver_res, tokens);
                        })
                    }else{
                        const key = 'member_profile';
                        DAM.select(key, email, (err, result) => {
                            if(err){
                                console.error(err);
                                callback(err, naver_res, tokens);
                                return;
                            }
                            if(result.length > 0){
                                callback(err, naver_res, tokens);
                            }else{
                                DAM.insert(key, {email:email}, (err) => {
                                    !err || console.error(err);
                                    callback(err,  naver_res, tokens);
                                })
                            }
                        })
                    }
                    
                })
            })
        })
    },

    /*
     로그 아웃 요청
     @param id(string) : SessionId
    */
    loginOut : (id, callback) => {
        DAM.delete(id, (err) => {
            if(err){
                console.error('error is logout mysql delete');
            }
            callback(err);
        })
    }
};

module.exports = service;

const DAM = require('../DAM/Login');
const createSecret = require('../modules/CreateSecret');
const createToken = require('../modules/CreateToken');
const naver = require('../modules/NaverApi');
const getEmail = require('../modules/getEmail');

const service = {
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
                body_obj.email_token = createToken.signToken(body.response.email);
                delete body_obj.expires_in;
                callback(error, response, JSON.stringify(body_obj));
            })
        })
    },
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

const DAM = require('../DAM/Login');
const createSecret = require('../modules/CreateSecret');
const createToken = require('../modules/CreateToken');
const client = require('../modules/config/naver.json');

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
                console.log(`${email} login success`);
                DAM.select('sessions', null, (err, result) => {
                    if(err){
                        console.error('error is mysql select sessions');
                        return
                    }
                    var data, session_email, session = false, sessions_id, i = 0;
                    for(i = 0; i < result.length; i++){
                        data = JSON.parse(result[i].data);
                        console.log(data.tokens);
                        session_email = createToken.verifyToken(data.tokens).email;
                        if(email === session_email){
                            session = true;
                            sessions_id = result[i].session_id;
                            break;
                        }
                    }
                    if(!session){
                        callback(err, 1);
                    }else{
                        DAM.delete(result[i].session_id, (err) => {
                            if(err){
                                console.error(`${email} attempted to delete an existing session due to a login request but failed`);
                                console.log(err);
                            }else{
                                console.log(`${email} has deleted an existing session with a login request`);
                                callback(err, 1);
                            }
                        })
                    }
                })
            }else{
                console.log(`${email} login failed`);
                callback(err, 0);
            }
        })
    },
    naverRedirect : (callback) => {
        // this.redirectURI = encodeURI("http://localhost:3000/api/naver_login/callback/");
        // this.api_url = 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=' 
        //     + this.client_id + '&redirect_uri=' 
        //     + this.redirectURI + '&state=' + this.state;
        //nid.naver.com/oauth2.0/authorize?response_type=code&client_id=jyvqXeaVOVmV&redirect_uri=http%3A%2F%2Fservice.redirect.url%2Fredirect&state=hLiDdL2uhPtsftcU
        console.log(client);
        const redirect = encodeURI(client.redirect_URI);
        // https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=jyvqXeaVOVmV&redirect_uri=http%3A%2F%2Fservice.redirect.url%2Fredirect&state=hLiDdL2uhPtsftcU
        const state = createSecret.createCertifyNumber(5, 5);
        const url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${client.id}&redirect_uri=${redirect}&state=${state}`;
        console.log(url);
        callback(url);
    },
    naverLogin : (query, callback) => {
        const code = query.code,
        state = query.state,
        api_url = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${client.id}&client_secret=${client.secret}&redirect_uri=${encodeURI(client.redirect_URI)}&code=${code}&state=${state}`,
        option = {
            url: api_url,
            headers: {'X-Naver-Client-Id':client.id, 'X-Naver-Client-Secret': client.secret}
        }
        var request = require('request');
        request.post(option, (error, response, body) => {
            console.log(response.statusCode);
            console.log(body);
            if(error){
                console.error('naver login failed');
            }
            callback(error, response, body);
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

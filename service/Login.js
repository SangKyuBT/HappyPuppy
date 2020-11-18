const DAO = require('../DAO/Login');
const createSecret = require('../modules/CreateSecret');
const client = require('../config/naver.json');
const service = {
    loginService : (body, callback) => {
        const email = body.email;
        DAO.select(email, (err, result) => {
            if(err || result.length === 0){
                console.error('error is login, mysql select failed');
                callback(err, 0);
                return;
            }
            const vp = JSON.parse(result[0].password_data);
            if(createSecret.ventriloquism(vp) === body.password){
                console.log(`${email} login success`);
                callback(err, 1);
            }else{
                console.log(`${email} login failed`);
                callback(err, 0);
            }
        })
    },
    naverService : (query, callback) => {
        const code = query.code,
        state = query.state,
        api_url = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${client.id}&client_secret=
        ${client.secret}&redirect_uri=${client.redirect_URI}&code=${code}&state=${state}`,
        option = {
            url: api_url,
            headers: {'X-Naver-Client-Id':client.id, 'X-Naver-Client-Secret': client.secret}
        }
        var request = require('request');
        request.post(option, (error, response, body) => {
            if(error){
                console.error('naver login failed');
            }
            callback(error, response, body);
        })
    },
    loginOut : (id, callback) => {
        DAO.delete(id, (err) => {
            if(err){
                console.error('error is logout mysql delete');
            }
            callback(err);
        })
    }
};

module.exports = service;

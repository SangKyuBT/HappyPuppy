let express = require('express');
let router = express.Router();
let createSecret = require('../routes/CreateSecret');

let jwt = require('jsonwebtoken');
let secretObj = require('../config/jwt');

router.post('/', function(req, res){
    // console.log(req.body);
    const user_info = req.body;
    connection.query('select password_data from member where email=?', user_info.email, function(err, result){
        if(err){
            console.log(err);
            throw err;
        }
        else if(result.length === 0){
            res.status(200).send({
                'message' : 1 //가입되지 않은 email
            })
        }else{
            const vp = JSON.parse(result[0].password_data);
            if(createSecret.ventriloquism(vp) === user_info.password) {
                console.log("login!!")

                let token = jwt.sign({'email' : user_info.email}, secretObj.secret, { expiresIn : '5m'})
                
                // 사용자 확인하는 방법 결과 값 : { email: 'wjdruf23@naver.com', iat: 1590230494, exp: 1590230794 }
                // let de = jwt.verify(token, secretObj.secret);
                req.session.cookie.expires = 3600000;
                req.session.tokens = token;
                req.session.isLogined = 1;

                req.session.save(function(){
                    res.status(200).send({
                        'message' : 0 //로그인 성공
                    })
                })
            }else{
                res.status(200).send({
                    'message' : 1 
                })
            }
        }
    })
})


module.exports = router;

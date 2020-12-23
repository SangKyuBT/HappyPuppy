/*
 로그인 상태 확인 라우트
 세션 상태 확인, 세션 이메일 응답, 세션 해제
*/
let express = require('express');
let router = express.Router();
const getEmail = require('../modules/getEmail'); //로그인 루트에 따른 이메일 추출
const {loginOut} = require('../service/Login'); // 로그인 서비스의 로그아웃 함수

/*
 현재 세션의 로그인 여부 응답
*/
router.get('/', function(req, res) {
    res.status(200).json({code:1, message:'success', login_code:req.session.isLogined});
});

/*
 세션의 이메일 응답
*/
router.get('/my_email', (req, res) => {
    const email = getEmail(req.session)
    res.status(200).json({code:1, email : email});
})

/*
 로그아웃 요청
*/
router.get('/logout', function(req, res){
    loginOut(req.sessionID, (err) => {
        if(err){
            console.log(err);
            res.status(200).send('failed');
            return
        }
        res.status(200).send("success");
    })
})

module.exports = router;

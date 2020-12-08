let express = require('express');
let router = express.Router();
const { service } = require('../service/Join');

//인증 메일 전송 요청
router.post ('/certify-number', (req, res) => {
    service.sendMail(req.body.email, (err, result) => {
        res.status(200).json({code: err ? 0 : 1, result:result});
    })
})

//이메일 필드 blur 발생시 이메일 중복 체크 요청
router.get('/duplicate_email/:email', (req, res) => {
    service.duplicate(req.params.email, (err, result) => {
        res.status(200).json({code: err ? 0 : 1, result : result});
    })
})

//회원가입 요청
router.post('/input_member', (req, res) => {
    service.addMember(req.body, (err, result) => {
        res.status(200).json({code : err ? 0 : 1 , result:result});
    })
})

module.exports = router;
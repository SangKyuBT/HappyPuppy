/*
 회원가입 라우트
 인증번호 메일전송, 이메일 중복 확인, 회원가입 수행
*/
import express from "express";
import service from "../service/JoinService";

const router = express.Router();

/*
 인증 메일 전송 요청
 @param email {string} 요청 보낼 이메일
*/
router.post ('/certify-number', (req, res) => {
    service.sendMail(req.body.email, (err, result) => {
        res.status(200).json({code: err ? 0 : 1, result:result});
    })
})

/*
 이메일 중복 체크 요청
 @param email {string} 확인할 이메일
*/
router.get('/duplicate_email/:email', (req, res) => {
    service.duplicate(req.params.email, (err, result) => {
        res.status(200).json({code: err ? 0 : 1, result : result});
    })
})

/*
 회원가입 요청
 @param member_info {obj} 회원 정보 객체
*/
router.post('/input_member', (req, res) => {
    service.addMember(req.body, (err, result) => {
        res.status(200).json({code : err ? 0 : 1 , result:result});
    })
})

module.exports = router;
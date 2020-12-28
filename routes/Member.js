/*
 마이페이지 라우트
*/
import express from "express";
import service from "../service/MemberService";
import { rsUpload } from "../modules/Multer"; //임시 디렉토리로 파일 업로드
import getEmail from "../modules/getEmail"; // 로그인 루트에 따른 이메일 추출

const router = express.Router();

/*
 회원 프로필 수정 요청
 @param body(obj) : 회원 프로필 정보 객체
 @param file(obj) : 회원 프로필 이미지
*/
router.post('/profile', (req, res) => {
    rsUpload(req, res, (err) => {
        if(err){
            console.error('error is profile rsUpload');
            res.status(200).json({code:0, message:'failed'});
            return
        }
        
        email = getEmail(req.session);
        service.updateImage(req.file, req.body, email, (err, filename) => {
            if(err){
                console.log(err);
                res.status(200).json({code:0, message:'failed'});
                return
            }
          res.status(200).json({code:1, message:'success', item : filename});
        })
    })
})

/*
 회원에 대한 대략적인 정보 요청
*/
router.get('/get_info', (req, res) => {
    const email = getEmail(req.session);
    service.getInfo(email, (err, result) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0});
            return;
        }
        res.status(200).json({code:1, item:result});
    })
});

/*
 회원 채널에 대한 대략적인 정보 요청
*/
router.get('/get_channel_info', (req, res) => {
    const email = getEmail(req.session);
    service.getMediaInfo(email, (err, result) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0});
            return;
        }
        res.status(200).json({code:1, result:result});
    })
});

/*
 회원 닉네임 변경 요청
 @param nickname(string) : 닉네임
*/
router.get('/nickname/:nickname', (req, res) => {
    const nickname = req.params.nickname;
    if(!!nickname && nickname.length <= 15){
        const email = getEmail(req.session);
        service.updateNickname(nickname, email, (err) => {
            if(err){
                console.log(err);
                res.status(200).json({code:0});
                return;
            }
            console.log(`mysql ${email} nickname change success`);
            res.status(200).json({code:1});
        })
    }else{
        res.status(200).json({code:0})
    }
})

/*
 회원 행사 정보 요청
*/
router.get('/get_events', (req, res) => {
    const email = getEmail(req.session);
    service.getMyEvent(email, (err, result) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0});
            return;
        }
        res.status(200).json({code:1, item : result});
    })
})

/*
 회원 실종 반려견 정보 요청
*/
router.get('/get_abandoned', (req, res) => {
    const email = getEmail(req.session);
    service.getMyAbandoned(email, (err, result) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0})
        }
        res.status(200).json({code:1, item:result})
    })
})

/*
 비밀번호 인증 메일 요청
 @param email(string) : 요청 이메일
*/
router.post('/certify_number', (req, res) => {
    const number = req.session.isLogined;
    if(!!number && number === 2){
        res.status(200).json({code:0});
        return
    }
    service.sendMail(req.body.email, (err, result) => {
        res.status(200).json({code: err ? 0 : 1, result:result});
    })
})

/*
 비밀번호 변경 요청
 @param body(obj) : 비밀번호 변경 정보 객체
*/
router.post('/find_pass', (req, res) => {
    const number = req.session.isLogined;
    if(!!number && number === 2){
        res.status(200).json({code:0});
        return
    }
    service.findPass(req.body, (err, result) => {
        res.status(200).json({code: err ? 0 : 1, result:result});
    })
})

/*
 회원 미디어 정보 요청
*/
router.get('/my_medias', (req, res) => {
    const email = getEmail(req.session);
    service.getMyMedias(email, (err, result) => {
        res.status(200).json({code: err ? 0 : 1, result : result});
    })
})

module.exports = router;

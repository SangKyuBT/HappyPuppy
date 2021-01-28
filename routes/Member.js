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
router.post('/profile', async (req, res) => {
    rsUpload(req, res, async (err) => {
        if(err){
            console.error('error is profile rsUpload');
            res.status(200).json({code:0, message:'failed'});
            return
        }
        const email = getEmail(req.session);
        const result = await service.updateImage(req.file, req.body, email);
        const rs_js = !result ? {code:0, message:'failed'} : {code:1, message:'success', item : result};
        res.status(200).json(rs_js);
    })
})

/*
 회원에 대한 대략적인 정보 요청
*/
router.get('/get_info', async (req, res) => {
    const email = getEmail(req.session);
    const item = await service.getInfo(email);
    res.status(200).json({code : item ? 1 : 0, item});
    
});

/*
 회원 채널에 대한 대략적인 정보 요청
*/
router.get('/get_channel_info', async (req, res) => {
    const email = getEmail(req.session);
    const result = await service.getMediaInfo(email);
    res.status(200).json({code : result ? 1 : 0, result});
});

/*
 회원 닉네임 변경 요청
 @param nickname(string) : 닉네임
*/
router.get('/nickname/:nickname', async (req, res) => {
    const nickname = req.params.nickname;
    if(!!nickname && nickname.length <= 15){
        const email = getEmail(req.session);
        const code = await service.updateNickname(nickname, email);
        res.status(200).json({code});
    }else{
        res.status(200).json({code:0})
    }
})

/*
 회원 행사 정보 요청
*/
router.get('/get_events', async (req, res) => {
    const email = getEmail(req.session);
    const item = await service.getMyEvent(email);
    res.status(200).json({code : item ? 1 : 0, item})
})

/*
 회원 실종 반려견 정보 요청
*/
router.get('/get_abandoned', async (req, res) => {
    const email = getEmail(req.session);
    const item = await service.getMyAbandoned(email);
    res.status(200).json({code : item ? 1 : 0, item})
})

/*
 비밀번호 인증 메일 요청
 @param email(string) : 요청 이메일
*/
router.post('/certify_number', async (req, res) => {
    const number = req.session.isLogined;
    if(!!number && number === 2){
        res.status(200).json({code:0});
        return
    }
    const {code, result} = await service.sendMail(req.body.email);
    res.status(200).json({code, result})
})

/*
 비밀번호 변경 요청
 @param body(obj) : 비밀번호 변경 정보 객체
*/
router.post('/find_pass', async (req, res) => {
    const number = req.session.isLogined;
    if(!!number && number === 2){
        res.status(200).json({code:0});
        return
    }
    const result = await service.findPass(req.body);
    res.status(200).json({code : result ? 1 : 0});
})

/*
 회원 미디어 정보 요청
*/
router.get('/my_medias', async (req, res) => {
    const email = getEmail(req.session);
    const {err, rs} = await service.getMyMedias(email);
    res.status(200).json({code : err ? 0 : 1, result : rs});
})

module.exports = router;

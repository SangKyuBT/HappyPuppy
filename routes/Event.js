/*
 행사 라우트
 이미지 추출, 업로드, 삭제 , 수정
*/
import express from "express";
import service from "../service/EventService";
import { rsUpload } from "../modules/Multer"; //임시 디렉토리에 파일 업로드
import getEmail from "../modules/getEmail"; //로그인 루트에 따른 이메일 추출

const router = express.Router();

/*
 행사 이미지 추출 및  행사 정보 업로드 요청
 @param file (obj) : 추출하기 위해 임시파일에 저장된 이미지 정보
 @param body(obj) : 행사 정보 문자열 객체
*/
router.post('/sharp_img', async (req, res) => {
    rsUpload(req, res, async (err) =>{
        if(err){
            console.log('error is event sharp rsUpload');
            res.status(200).json({code:1});
            return;
        }
        const file = req.file, body = req.body,
        email = getEmail(req.session);
        const result = await service.insert(file, body, email);
        res.status(200).json({code: result ? 1 : 0});

    })
})

/*
 행사 이미지 추출 및 행사 수정 요청
 @param file (obj) : 추출하기 위해 임시파일에 저장된 이미지 정보
 @param body(obj) : 행사 정보 문자열 객체
*/
router.post('/update', async (req, res) => {
    rsUpload(req, res, async (err) =>{
        if(err){
            console.log('error is event update rsUpload');
            res.status(200).json({code:1});
            return;
        }
        const {file, body} = req,
        email = getEmail(req.session);
        const result = await service.update(file, body, email);
        res.status(200).json({code : result ? 1 : 0});
        
    })
})

/*
 달력의 해당 월에 대한 행사 정보 요청
 @param start(string) : 날짜의 시작
 @param end(string) : 날짜의 끝
*/
router.get('/get_events/:start/:end', async (req, res) => {
    const {start, end} = req.params;
    const items = await service.selectCalendar(start, end);
    res.status(200).json({message : items ? 1 : 0, items})
})

/*
 시작 날짜에 따른 행사 정보 요청
 @param start(string) : 시작 날짜
*/
router.get('/get_asc/:start', async (req, res) => {
    const start = req.params.start;
    const items = await service.selectCarouesl(start);
    res.status(200).json({code : items ? 1 : 0, items});
})

/*
 행사 정보 삭제 요청
 @param num(number) : 삭제할 행사 번호
*/
router.post('/delete_event', async (req, res) => {
    const email = getEmail(req.session);
    const result = await service.delete(req.body.num, email);
    res.status(200).json({code : !result || !result.affectedRows ? 0 : 1});
    
})

module.exports = router;
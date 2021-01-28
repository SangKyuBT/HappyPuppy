/*
  실종 반려견 라우트
  실종 반려견에 대한 업로드, 수정, 삭제, 조회
*/
import express from "express";
import service from "../service/AbandonedService";
import { abUpload } from "../modules/Multer"; //실종 반려견 버킷 s3 업로드
import getEmail from "../modules/getEmail"; //로그인 루트에 따른 이메일 추출
const router = express.Router();

/*
 실종 반려견에 대한 정보 요청
*/
router.get('/', async (req, res) => {
    const result = await service.select(null, null);
    res.status(200).json({message : result || result.length ? 1 : 0, result})

})

/*
 지역에 따른 실종 반려견 정보 요청
 @param place(string) : 검색하는 지역
*/
router.get('/place_search/:place', async (req, res) => {
    if(!req.params.place){
        res.status(200).send({message : 0});
        return
    }
    const result = await service.select(req.params.place, null);
    res.status(200).json({message : result || result.length ? 1 : 0, result})
})

/*
 번호에 따른 실종 반려견 정보 요청
 @param num(number) : 실종 반려견 번호
*/
router.get('/target/:num', async (req, res) => {
    if(!req.params.num){
        res.status(200).send({message : 0});
        return
    }
    const result = await service.select(null, req.params.num);
    res.status(200).json({message : result || result.length ? 1 : 0, result})
})

/*
 업로드 요청
 @param form(obj) : 실종 반려견 정보 객체
 @param files(obj) : 실종 반려견 전단지 이미지 정보
*/
router.post('/insert_poster', async (req, res) => {
    abUpload(req, res, async (err) => {
        if(err){
            res.status(200).json({code : 0});
            return;
        }
        const email = getEmail(req.session);
        const result = await service.insert(req.body.form, req.files, email);
        res.status(200).json({code : result ? 1 : 0});
    })
})

/*
 수정 요청
 @param form(obj) : 실종 반려견 정보 객체
 @param files(obj) : 실종 반려견 전단지 이미지 정보
*/
router.post('/update_poster', async (req, res) => {
    abUpload(req, res, async (err) => {
        if(err){
            res.status(200).json({code : 0});
            return;
        }
        const email = getEmail(req.session);
        const result = await service.update(req.body.form, req.files, email);
        res.status(200).json({code : result ? 1 : 0});
    })
})

/*
 삭제 요청
 @param body(obj) : 
*/
router.post('/delete_poster', async (req, res) => {
    const email = getEmail(req.session);
    const result = await service.delete(req.body, email);
    res.status(200).json({code : result ? 1 : 0});
})

module.exports = router;
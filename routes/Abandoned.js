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
router.get('/', (req, res) => {
    service.select(null, null, (err, result) => {
        if(err){
            console.error(err);
            res.status(200).send({message: 0});
            return
        }
        res.status(200).json({message: result.length > 0 ? 1 : 0, result : result})
    })

})

/*
 지역에 따른 실종 반려견 정보 요청
 @param place(string) : 검색하는 지역
*/
router.get('/place_search/:place', (req, res) => {
    if(!req.params.place){
        res.status(200).send({message : 0});
        return
    }
    service.select(req.params.place, null, (err, result) => {
        if(err){
            console.error(err);
            res.status(200).send({message: 0});
            return
        }
        const rs = result.length > 0 ? {message: 1, result : result} : {message: 0, result : result} 
        res.status(200).json(rs)
    })
})

/*
 번호에 따른 실종 반려견 정보 요청
 @param num(number) : 실종 반려견 번호
*/
router.get('/target/:num', (req, res) => {
    if(!req.params.num){
        res.status(200).send({message : 0});
        return
    }
    service.select(null, req.params.num, (err, result) => {
        if(err){
            console.error(err);
            res.status(200).send({message: 0});
            return
        }
        const rs = result.length > 0 ? {message: 1, result : result} : {message: 0, result : result} 
        res.status(200).json(rs)
    })
})

/*
 업로드 요청
 @param form(obj) : 실종 반려견 정보 객체
 @param files(obj) : 실종 반려견 전단지 이미지 정보
*/
router.post('/insert_poster', (req, res) => {
    abUpload(req, res, (err) => {
        if(err){
            res.status(200).json({code : 0});
            return;
        }
        const email = getEmail(req.session);
        service.insert(req.body.form, req.files, email, (err) => {
            if(err){
                res.status(200).json({code : 0});
                return;
            }
            res.status(200).json({code : 1});
        })
    })
})

/*
 수정 요청
 @param form(obj) : 실종 반려견 정보 객체
 @param files(obj) : 실종 반려견 전단지 이미지 정보
*/
router.post('/update_poster', (req, res) => {
    abUpload(req, res, (err) => {
        if(err){
            res.status(200).json({code : 0});
            return;
        }
        const email = getEmail(req.session);
        service.update(req.body.form, req.files, email, (err) => {
            res.status(200).json({code : !err ? 1 : 0});
        })
    })
})

/*
 삭제 요청
 @param body(obj) : 
*/
router.post('/delete_poster', (req, res) => {
    const email = getEmail(req.session);
    service.delete(req.body, email, (err) => {
        if(err){
            console.log(err);
            res.status(200).json({code : 0});
            return;
        }
        res.status(200).json({code : 1});
    })
})

module.exports = router;
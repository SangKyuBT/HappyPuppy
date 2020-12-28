/*
 지도 연관 검색 라우트
*/
import express from "express";
import service from "../service/RelevantService";

const router = express.Router();

/*
 키워드 연관 검색 요청
 @param keyword(string) : 검색 키워드
*/
router.get('/map/:keyword', (req, res) => {
    service.getKeywords(req.params.keyword, (err, items) => {
        if(err){
            console.log(err);
        }
        res.send(items);
    })

});

/*
 검색 결과 이미지 url 요청
 @param body(obj) : 요청 이미지 정보 객체
*/
router.post('/mapImg', (req, res) => {
    service.getPlaceImgs(req.body, (err, items) => {
        if(err){
            console.log(err);
        }
        res.json(items);
    })
    
});

module.exports = router;
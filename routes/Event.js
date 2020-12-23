/*
 행사 라우트
 이미지 추출, 업로드, 삭제 , 수정
*/
let express = require('express');
let router = express.Router();
const {service} = require('../service/Event');
const {rsUpload} = require('../modules/Multer'); //임시 디렉토리에 파일 업로드
const getEmail = require('../modules/getEmail'); //로그인 루트에 따른 이메일 추출

/*
 행사 이미지 추출 및  행사 정보 업로드 요청
 @param file (obj) : 추출하기 위해 임시파일에 저장된 이미지 정보
 @param body(obj) : 행사 정보 문자열 객체
*/
router.post('/sharp_img', (req, res) => {
    rsUpload(req, res, (err) =>{
        if(err){
            console.log('error is event sharp rsUpload');
            res.status(200).json({code:1});
            return;
        }
        const file = req.file, body = req.body,
        email = getEmail(req.session);
        service.insert(file, body, email, (err) => {
            if(err){
                console.error(err);
                res.status(200).json({code:0});
                return
            }
            res.status(200).json({code:1});
        })
    })
})

/*
 행사 이미지 추출 및 행사 수정 요청
 @param file (obj) : 추출하기 위해 임시파일에 저장된 이미지 정보
 @param body(obj) : 행사 정보 문자열 객체
*/
router.post('/update', (req, res) => {
    rsUpload(req, res, (err) =>{
        if(err){
            console.log('error is event update rsUpload');
            res.status(200).json({code:1});
            return;
        }
        const {file, body} = req,
        email = getEmail(req.session);
        service.update(file, body, email, (err) => {
            if(err){
                console.error(err);
                res.status(200).json({code:0});
                return
            }
            res.status(200).json({code:1});
        })
    })
})

/*
 달력의 해당 월에 대한 행사 정보 요청
 @param start(string) : 날짜의 시작
 @param end(string) : 날짜의 끝
*/
router.get('/get_events/:start/:end', (req, res) => {
    const {start, end} = req.params;
    service.selectCalendar(start, end, (err, result) => {
        if(err){
            console.log(err);
            res.status(200).send({message:0});
            return;
        }
        res.status(200).send({message:1, items:result});
    })
})

/*
 시작 날짜에 따른 행사 정보 요청
 @param start(string) : 시작 날짜
*/
router.get('/get_asc/:start',(req, res) => {
    const start = req.params.start;
    service.selectCarouesl(start, (err, result) => {
        if(err){
            console.log(err);
            res.status(200).send({message:0});
            return;
        }
        res.status(200).send({message:1, items:result});
    })
})

/*
 행사 정보 삭제 요청
 @param num(number) : 삭제할 행사 번호
*/
router.post('/delete_event', (req, res) => {
    const email = getEmail(req.session);
    service.delete(req.body.num, email, (err, result) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0, message:'mysql excution failed'});
            return;
        }
        if(!result.affectedRows){
            res.status(200).json({code:1, message:'mysql delete failed'});
            return
        }
        res.status(200).json({code:1, message:'delete success'});
    })
})

module.exports = router;
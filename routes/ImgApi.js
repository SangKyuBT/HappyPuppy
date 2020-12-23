/*
 이미지 라우트
 이미지 base64인코딩, 이미지 응답
*/
let express = require('express');
let router = express.Router();
const { service } = require('../service/Img');
const {rsUpload} = require('../modules/Multer'); //임시 디렉토리로 파일 업로드 모듈

/*
 S3에 저장되어 있는 이미지를 base64인코딩 요청
 @param poster(string) : 인코딩 요청 키
*/
router.get('/rpb/:poster', (req, res) => {
  service.s3Base64(req.params.poster, (err, result) => {
    res.status(200).json({message : !err ? 1 : 0, result : result});
  })
});

/*
 이미지 base64 인코딩 요청
 @param file(obj) : 임시 디렉토리로 업로드된 파일 정보
*/
router.post('/return_buffer', (req, res) => { 
  rsUpload(req, res, (err) => {
    if(err){
      res.status(200).json({code:0, mesaage:'failed'});
      return
    }
    service.base64(req.file.path, (err, imgData) => {
      if(err){
        console.log(err);
      }
      res.status(200).json({code:1, imgData:imgData});
    })
  })
})

/*
 이미지 요청
 @param name(string) : S3 버킷 이름
 @param key(string) : S3 키
*/
router.get('/get_img/:name/:key', (req, res) => {
  let result = '';
  service.getImg(`${req.params.name}/${req.params.key}`, (err, data) => {
    if(err){
      console.log(err);
      result = 'image is not defined';
    }else{
      result = data.Body;
    }
    res.writeHead(200, { "Context-Type": "image/jpg" });
    res.write(result); 
    res.end(); 
  })
});

/*
 이미지 썸네일 요청
 @param name1, name2(string) : S3 버킷 이름
 @param key(string) : S3 키
*/
router.get('/get_thumbnail/:name1/:name2/:key', (req, res) => {
  let result = '';
  service.getImg(`${req.params.name1}/${req.params.name2}/${req.params.key}`, (err, data) => {
    if(err){
      console.log(err);
      result = 'image is not defined';
    }else{
      result = data.Body;
    }
    res.writeHead(200, { "Context-Type": "image/jpg" });
    res.write(result); 
    res.end(); 
  })
});


module.exports = router;

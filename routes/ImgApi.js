/*
 이미지 라우트
 이미지 base64인코딩, 이미지 응답
*/
import express from "express";
import service from "../service/ImgApiService";
import { rsUpload } from "../modules/Multer"; //임시 디렉토리로 파일 업로드 모듈

const router = express.Router();

/*
 S3에 저장되어 있는 이미지를 base64인코딩 요청
 @param poster(string) : 인코딩 요청 키
*/
router.get('/rpb/:poster', async (req, res) => {
  const result = await service.s3Base64(req.params.poster);
  res.status(200).json({message : result ? 1 : 0, result});
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
    const imgData = service.base64(req.file.path); 
    res.status(200).json({code : !imgData ? 0 : 1, imgData});
    
  })
});

/*
 이미지 요청
 @param name(string) : S3 버킷 이름
 @param key(string) : S3 키
*/
router.get('/get_img/:name/:key', async (req, res) => {
  const data = await service.getImg(`${req.params.name}/${req.params.key}`);
  res.writeHead(200, { "Context-Type": "image/jpg" });
  res.write(data ? data : 'image is not defined'); 
  res.end(); 

});

/*
 이미지 썸네일 요청
 @param name1, name2(string) : S3 버킷 이름
 @param key(string) : S3 키
*/
router.get('/get_thumbnail/:name1/:name2/:key', async (req, res) => {
  const data = await service.getImg(`${req.params.name1}/${req.params.name2}/${req.params.key}`);
  res.writeHead(200, { "Context-Type": "image/jpg" });
  res.write(data ? data : 'image is not defined'); 
  res.end(); 
});


module.exports = router;
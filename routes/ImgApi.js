let express = require('express');
let router = express.Router();
const { service } = require('../service/Img');
const {rsUpload} = require('../modules/Multer');

//받은 파일명들을 s3에서 다운로드한 뒤 base64로 인코딩 후 client에게 전송 
router.post('/rpb', (req, res) => {
  service.s3Base64(req.body, (err, b_imgs) => {
    if(err){
      console.log(err);
      res.status(200).json({message : 0})
      res.end();
      return;
    }
    res.status(200).json({message : 1, b_imgs : b_imgs});
  })
});

//전송받은 이미지를 버퍼를 전송
//에러처리는 imgData는 null 값이므로 console만 띄워 줌
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

//밑에 부터는 s3에 저장된 이미지를 전송합니다.
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

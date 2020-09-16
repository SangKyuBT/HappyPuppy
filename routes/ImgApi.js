var express = require('express');
var router = express.Router();
var multer = require('multer');
var imgConvert = require('base64-img'); // 받아온 이미지를 문자열 버퍼로 변환
var fs = require('fs'); //변환된 버퍼를 확인하거나 파일 삭제 등등...
const path = require('path');
const ad_upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/Abandoned/');
    },
    filename: function (req, file, cb) {
      cb(null, new Date().valueOf() + path.extname(file.originalname));
    }
  }),
});

//받은 이미지를 버퍼로 리턴
router.post('/return_buffer', multer({ dest: 'public/images/Reserve/'}).single('img'), (req, res, next)=>{
  imgConvert.base64(req.file.path, (err, imgData) => {
    if(err) return next(err)
    fs.unlinkSync(req.file.path)
    res.send(imgData)
  })
})


router.get('/test', (req, res, next) => {
    // imgConvert.base64(req.file.path, (err, imgData) => {
    //     if(err) return next(err)
    //     fs.unlinkSync(req.file.path)
    //     res.send(imgData)
    // // });
    fs.readFile('public/images/AdandonedImges/1600245334046',              //파일 읽기
        function (err, data)
        {
            //http의 헤더정보를 클라이언트쪽으로 출력
            //image/jpg : jpg 이미지 파일을 전송한다
            //write 로 보낼 내용을 입력
            res.writeHead(200, { "Context-Type": "image/jpg" });//보낼 헤더를 만듬
            res.write(data);   //본문을 만들고
            res.end();  //클라이언트에게 응답을 전송한다
        }
    );
    // res.send('!!!!!!!!!!!')
});

router.post('/insert_poster', ad_upload.fields([{name : 'main'}, {name : 'sb0'}, {name : 'sb1'}, {name : 'sb2'}]), (req, res) => {
  const form = JSON.parse(req.body.form), 
  files = req.files, 
  sb_imgs = JSON.stringify({
    sb0 : files.sb0[0].filename, 
    sb1 : files.sb1[0].filename,
    sb2 : files.sb2[0].filename
  });
  let ab_info = {};
  Object.keys(form).forEach(f => {
    ab_info[f] = form[f];
  })
  ab_info.main_img = files.main[0].filename;
  ab_info.sb_imgs = sb_imgs;
  console.log(ab_info)

  connection.query('insert into abandoned set ?', ab_info, (err) => {
    if(err){
      console.log(err);
      res.status(500).send(0);
      return
    }
    res.status(200).send({message : 1});
  })
  // res.status(200).send({message : 1});
})


module.exports = router;

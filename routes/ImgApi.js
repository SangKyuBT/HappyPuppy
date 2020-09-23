let express = require('express');
let router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const createdToken = require('../modules/CreateToken');
const imgConvert = require('base64-img'); // 받아온 이미지를 문자열 버퍼로 변환
const fs = require('fs'); //변환된 버퍼를 확인하거나 파일 삭제 등등...
const path = require('path');
const aws = require("aws-sdk");
const { timeStamp } = require('console');
aws.config.loadFromPath(__dirname + "/../config/awsconfig.json");
const s3 = new aws.S3();

const ab_upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "hpsangkyu/abandoned",
    key: function (req, file, cb) {
      cb(null, new Date().valueOf() + path.extname(file.originalname));
    },
    acl: 'public-read-write',
  })
});

const ev_upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "hpsangkyu/event",
    key: function (req, file, cb) {
      cb(null, new Date().valueOf() + path.extname(file.originalname));
    },
    acl: 'public-read-write',
  })
});

//전송받은 이미지를 버퍼를 전송
router.post('/return_buffer', multer({ dest: 'public/images/Reserve/'}).single('img'), (req, res, next)=>{
  const path = req.file.path;
  imgConvert.base64(path, (err, imgData) => {
    if(err) return next(err)
    fs.unlinkSync(path);
    res.send(imgData);
    return false;
  })
  
})

//전송 받은 이미지들을 저장하고 db에 내용 저장
router.post('/insert_poster', ab_upload.fields([{name : 'main'}, {name : 'sb0'}, {name : 'sb1'}, {name : 'sb2'}]), (req, res) => {
  if(!!req.session.tokens){
    try{
      const form = JSON.parse(req.body.form), 
      files = req.files, 
      sb_imgs = JSON.stringify({
        sb0 : files.sb0[0].key, 
        sb1 : files.sb1[0].key,
        sb2 : files.sb2[0].key
      });
      let ab_info = {};
      console.log(files);
      const token_info = createdToken.verifyToken(req.session.tokens);
      ab_info.email = token_info.email;
      Object.keys(form).forEach(f => {
        ab_info[f] = form[f];
      })
      ab_info.main_img = files.main[0].key;
      ab_info.sb_imgs = sb_imgs;
    
      connection.query('insert into abandoned set ?', ab_info, (err) => {
        if(err){
          console.log(err);
          res.status(500).send({message : 0});
          return
        }
        res.status(200).send({message : 1});
      })
    }catch(err){
      console.log(err);
      res.status(500).send({message : 0});
    }
  }else{ 
    res.status(500).send({message : 0});
  }
})

//받은 이름의 이미지를 전송
router.get('/ab/:name', (req, res, next) => {
  
  console.log(req.params.name);
  fs.readFile('public/images/Abandoned/' + req.params.name, (err, data) => {
    if(err){
      res.status(500).send('not found')
      return
    }
      res.writeHead(200, { "Context-Type": "image/jpg" });//보낼 헤더를 만듬
      res.write(data);   //본문을 만들고
      res.end();  //클라이언트에게 응답을 전송한다
    }
  );
});

//받은 파일명들을 s3에서 다운로드한 뒤 base64로 인코딩 후 client에게 전송 
router.post('/rpb', (req, res, next) => {
  const paths = req.body;
  let num = 0;
  let b_imgs = {};
  Object.keys(paths).forEach(f => {
    try{
      const path = 'public/images/Reserve/' + paths[f];
      var fileStream = fs.createWriteStream(path);
      var s3Stream = s3.getObject({Bucket : 'hpsangkyu', Key : 'abandoned/' + paths[f]}).createReadStream();
      s3Stream.on('error', function(err) {
        console.error(err);
      });
      s3Stream.pipe(fileStream).on('error', function(err) {
        console.error(err);
      }).on('close', function() {
        console.log("pipe가 닫혔엉")
        num++;
        b_imgs[f] = imgConvert.base64Sync(path);
        if(num > 3){
          res.status(200).json({message : 1, b_imgs : b_imgs});
          Object.keys(paths).forEach( f => {
            console.log('public/images/Reserve/' + paths[f]);
            fs.unlink('public/images/Reserve/' + paths[f], (err) => {
              err ? console.error(err) : console.log('delete Complete');
            });
          })
        }
      });
    }catch(err){
      console.log(err);
      res.status(500).json({message : 0})
      res.end();
      return;
    }
  })
});
module.exports = router;

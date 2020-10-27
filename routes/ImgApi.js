let express = require('express');
let router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const createdToken = require('../modules/CreateToken');
const imgConvert = require('base64-img'); // 받아온 이미지를 문자열 버퍼로 변환
const sharp = require('sharp');
const fs = require('fs'); //변환된 버퍼를 확인하거나 파일 삭제 등등...
const path = require('path');
const aws = require("aws-sdk");
aws.config.loadFromPath(__dirname + "/../config/awsconfig.json");
const s3 = new aws.S3();

//실종 반려견 관련 이미지 upload
//s3, multerS3
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

//이미지 추출을 위한 임시 저장소로 이용하는 upload
//multer
const rs_upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/Reserve/');
    },
    filename: function (req, file, cb) {
      cb(null, new Date().valueOf() + path.extname(file.originalname));
    }
  }),
});

//받은 이미지의 일부를 추출하여 s3에 업로드하고
//다른 정보들을 db에 저장
router.post('/sharp', rs_upload.single('img'), (req, res, next) => {
  if(!!req.session.tokens){
    const file = req.file,
    form = JSON.parse(req.body.form), //db에 들어갈 정보들
    position = JSON.parse(req.body.position), //추출할때 사용될 정보
    name_sharp = `sharp${file.filename}`, //추출될 이미지 이름
    path_sharp = file.destination + name_sharp;//추출될 이미지 경로
    sharp(file.path).extract(position).toFile(path_sharp, (err, info) => {
      if (err) {
        console.log(err);
        res.status(500).send({message : 0});
        return next(err)
      }
      //s3업로드에 필요한 params
      const params = {
        Bucket : "hpsangkyu",
        Key : `event/${name_sharp}`,
        Body : fs.readFileSync(path_sharp)
      }
      //추출된 이미지 s3에 업로드
      s3.upload(params, function(err, data) {
        if(err){
          console.error(err);
          res.status(500).send({message : 0});
          return
        }
        console.log('event image s3 upload success');
        form.email = "wjdruf23@naver.com";
        form.ev_img = name_sharp;
        connection.query('insert into event set ?', form, (err) => {
          if(err){
            console.error(err);
            res.status(500).send({message : 0});
          }else{
            res.status(200).send({message : 1});
          }
          //임시 저장소의 이미지 삭제
          fs.unlinkSync(file.path);
          fs.unlinkSync(path_sharp);
        })
      })
    })
  }else{
    console.log('not login!');
    res.status(500).send({message : 0});
  }
})

//전송받은 이미지를 버퍼를 전송
router.post('/return_buffer', multer({ dest: 'public/images/Reserve/'}).single('img'), (req, res, next) => { 
  const path = req.file.path;
  imgConvert.base64(path, (err, imgData) => {
    if(err) return next(err)
    fs.unlinkSync(path);
    res.send(imgData);
  })
  
})

//s3에 저장된 이미지를 전송합니다.
router.get('/get_img/:name/:key', (req, res, next) => {
  let result = '';
  s3.getObject({Bucket:"hpsangkyu", Key:`${req.params.name}/${req.params.key}`}, function(err, data ){
    if(err) {
      console.error(err);
      result = 'image is not defined';
    }else{
      result = data.Body;
    }
    res.writeHead(200, { "Context-Type": "image/jpg" });
    res.write(result); 
    res.end(); 
  })
});

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

//받은 파일명들을 s3에서 다운로드한 뒤 base64로 인코딩 후 client에게 전송 
router.post('/rpb', (req, res, next) => {
  const paths = req.body;
  let num = 0;
  let b_imgs = {};
  Object.keys(paths).forEach(f => {
    try{
      const path = 'public/images/Reserve/' + paths[f];
      var file_stream = fs.createWriteStream(path);
      var s3_stream = s3.getObject({Bucket : 'hpsangkyu', Key : 'abandoned/' + paths[f]}).createReadStream();
      s3_stream.on('error', function(err) {
        console.error(err);
      });
      s3_stream.pipe(file_stream).on('error', function(err) {
        console.error(err);
      }).on('close', function() {
        num++;
        b_imgs[f] = imgConvert.base64Sync(path);
        if(num > 3){
          res.status(200).json({message : 1, b_imgs : b_imgs});
          Object.keys(paths).forEach( f => {
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

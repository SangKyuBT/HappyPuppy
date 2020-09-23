let express = require('express');
let router = express.Router();
const path = require("path");
const multer = require("multer");
const multerS3 = require('multer-s3');
const fs = require('fs');


const aws = require("aws-sdk");
aws.config.loadFromPath(__dirname + "/../config/awsconfig.json");
const s3 = new aws.S3();

let upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: "hpsangkyu/test",
      key: function (req, file, cb) {
        cb(null, new Date().valueOf() + path.extname(file.originalname));
      },
      acl: 'public-read-write',
    })
});


router.get('/', (req, res, next) => {
    res.send('success');
});
// s3에 업로드
router.post('/upload', upload.single('img'), (req, res, next) => {
    console.log(req.file);
    console.log("test");
    res.send('success');
})
// router.post('/uploads', upload.fields([{name : 'main'}, {name : 'sb0'}, {name : 'sb1'}, (req, res, next) => {
//     console.log(req.file);
//     console.log("test");
//     res.send('success');
// })

// s3에 있는 파일 가져와서 파일 저장
router.get('/testd', (req, res, next) => {
    var file = fs.createWriteStream('routes/logo.jpg');
    var params = {
        Bucket : 'hpsangkyu', Key : 'test/1600779635927.jpg'
    }
    s3.getObject(params).createReadStream().pipe(file);
    res.send('success');
})

router.get('/delete', (req, res, next) => {
    // //오브젝트 하나 삭제
    // s3.deleteObject({
    //     Bucket : 'hpsangkyu',
    //     Key : 'test/1600779635927.jpg'
    // }, (err, data) => {
    //     if(err){throw err;}
    //     console.log('delete', data);
    // })
    // //오브젝트 여러개 삭제
    // var params = {
    //     Bucket: "examplebucket", 
    //     Delete: {
    //      Objects: [
    //         {
    //        Key: "HappyFace.jpg", 
    //        VersionId: "2LWg7lQLnY41.maGB5Z6SWW.dcq0vx7b"
    //       }, 
    //         {
    //        Key: "HappyFace.jpg", 
    //        VersionId: "yoz3HB.ZhCS_tKVEmIOr7qYyyAaZSKVd"
    //       }
    //      ], 
    //      Quiet: false
    //     }
    // };
    // s3.deleteObjects(params, function(err, data) {
    //     if (err) console.log(err, err.stack); // an error occurred
    //     else     console.log(data);           // successful response
    // });
})


module.exports = router;

/*
 S3, 임시디렉토리 파일 업로드 수행
*/
const multer = require('multer'); //formData를 다루기위한 모듈
const multerS3 = require('multer-s3'); //multer 대상을 S3로 하기 위한 모듈
const {s3, bucket} = require('./S3'); //S3 및 버킷 정보
const path = require('path');

/*
 미디어 파일 업로드 모듈
 @file : 비디오, 썸네일 이미지
*/
const mediaUpload = multer({
  storage: multerS3({
      s3: s3,
      bucket: bucket.media_bucket,
      key: function (req, file, cb) {
        const item = !file.mimetype.indexOf('image') ? 'image/' : 'video/';
        cb(null, item + new Date().valueOf() + path.extname(file.originalname));
      },
      acl: 'aws-exec-read',
  })
}).fields([{name : 'video'}, {name : 'img'}]);

/*
 임시 디렉토리로 파일 업로드
 @file : 이미지
*/
const rsUpload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, 'reserveImg/');
      },
      filename: function (req, file, cb) {
        cb(null, new Date().valueOf() + path.extname(file.originalname));
      }
    }),
}).single('img');

/*
 실종 반려견 파일 업로드
 @file : 전단지 수정을 위한 원본이미지, 전단지 이미지
*/
const abUpload = multer({
    storage: multerS3({
      s3: s3,
      bucket: bucket.ab_bucket,
      key: function (req, file, cb) {
        cb(null, new Date().valueOf() + path.extname(file.originalname));
      },
      acl: 'aws-exec-read',
    })
}).fields([{name : 'main'}, {name : 'sb0'}, {name : 'sb1'}, {name : 'sb2'}, {name : 'poster'}]);

module.exports = {mediaUpload, abUpload, rsUpload }
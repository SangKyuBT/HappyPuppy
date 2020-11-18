const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const {s3, bucket} = require('./S3');

const rsUpload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, 'public/images/Reserve/');
      },
      filename: function (req, file, cb) {
        cb(null, new Date().valueOf() + path.extname(file.originalname));
      }
    }),
}).single('img');

const abUpload = multer({
    storage: multerS3({
      s3: s3,
      bucket: bucket.ab_bucket,
      key: function (req, file, cb) {
        // console.log(file.mimetype);
        cb(null, new Date().valueOf() + path.extname(file.originalname));
      },
      acl: 'aws-exec-read',
    })
}).fields([{name : 'main'}, {name : 'sb0'}, {name : 'sb1'}, {name : 'sb2'}]);

const mediaUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: bucket.media_bucket,
        key: function (req, file, cb) {
          const item = !file.mimetype.indexOf('image') ? 'image/' : 'video/';
          console.log(item);
          cb(null, item + new Date().valueOf() + path.extname(file.originalname));
        },
        acl: 'aws-exec-read',
    })
}).fields([{name : 'video'}, {name : 'img'}]);

const videoUpload = multer({
  storage: multerS3({
      s3: s3,
      bucket: bucket.video_bucket,
      key: function (req, file, cb) {
        cb(null, new Date().valueOf() + path.extname(file.originalname));
      },
      acl: 'aws-exec-read',
  })
}).single('video');

const thumbnailUpload = multer({
  storage: multerS3({
      s3: s3,
      bucket: bucket.thumbnail_bucket,
      key: function (req, file, cb) {
        cb(null, new Date().valueOf() + path.extname(file.originalname));
      },
      acl: 'aws-exec-read',
  })
}).single('img');


module.exports.abUpload = abUpload;
module.exports.rsUpload = rsUpload;
module.exports.mediaUpload = mediaUpload;
module.exports.videoUpload = videoUpload;
module.exports.thumbnailUpload = thumbnailUpload;
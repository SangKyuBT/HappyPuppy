let express = require('express');
let router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const createdToken = require('../modules/CreateToken');
const fs = require('fs'); //변환된 버퍼를 확인하거나 파일 삭제 등등...
const path = require('path');
const aws = require("aws-sdk");
aws.config.loadFromPath(__dirname + "/../config/awsconfig.json");
const s3 = new aws.S3();



router.post('/input_video', multer({dest: 'public/video'}).single('video'), (req, res) => {
    
})

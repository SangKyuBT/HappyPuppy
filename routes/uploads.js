let express = require('express');
let router = express.Router();
const aws = require("aws-sdk");
const path = require("path");
aws.config.loadFromPath(__dirname + "/../config/awsconfig.json");
const multer = require("multer");
const multerS3 = require('multer-s3');
const fs = require('fs');
let s3 = new aws.S3();

let ab_upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: "hpsangkyu/abandoned",
      key: function (req, file, cb) {
        cb(null, new Date().valueOf() + path.extname(file.originalname));
      },
      acl: 'public-read-write',
    })
});

let ev_upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: "hpsangkyu/event",
      key: function (req, file, cb) {
        cb(null, new Date().valueOf() + path.extname(file.originalname));
      },
      acl: 'public-read-write',
    })
});

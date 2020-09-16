var express = require('express');
var router = express.Router();
var multer = require('multer');
var imgConvert = require('base64-img');
var fs = require('fs');
const path = require('path');
const ad_upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/images/AdandonedImges/');
        },
        filename: function (req, file, cb) {
            cb(null, new Date().valueOf() + path.extname(file.originalname));
        }
    }),
});



module.exports = router;

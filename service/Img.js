/*
 이미지 서비스
 S3 이미지 base64 인코딩, 이미지 응답
*/
const {practice} = require('../modules/S3'); //S3 모듈
const fs = require('fs'); //파일 시스템
const imgConvert = require('base64-img'); //이미지 base64 인코딩

const service = {
    /*
     S3에 있는 이미지 base64로 인코딩하여 응답
     @param poster(string) : S3 키
    */
    s3Base64 : (poster, callback) => {
        practice.read(`abandoned/${poster}`, (err, data) => {
            if(err){
                console.error(err);
                callback(err);
                return;
            }
            var base64 =  `data:image/jpg;base64,${data.Body.toString('base64')}`;
            callback(err, base64);
        })
    },
    
    /*
     임시 폴더에 있는 이미지 base64 인코딩하여 응답
     @param path(string) : 임시 디렉토리내의 이미지 위치
    */
    base64 : (path, callback) => {
        imgConvert.base64(path, (err, imgData) => {
            if(err){
                console.error('retturn buffer base64 errror');
            }
            fs.unlinkSync(path);
            callback(err, imgData);
        })
    },

    /*
     S3 이미지 응답
     @param key : S3 키
    */
    getImg : (key, callback) => {
        practice.read(key, (err, data) => {
            if(err){
                console.error(`getImg s3 key:${key} error`);
            }
            callback(err, data);
        })
    }
}

module.exports.service = service;
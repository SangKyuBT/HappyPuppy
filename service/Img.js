const {practice} = require('../modules/S3');
const fs = require('fs');
const imgConvert = require('base64-img');
const service = {
    //받은 이미지들을 base64로 인코딩하여 후 응답
    s3Base64 : (paths, callback) => {
        let num = 0;
        const b_imgs = {};
        Object.keys(paths).forEach(f => {
            const path = `abandoned/${paths[f]}`;
            practice.read(path, (err, data) => {
                !err || console.error(err);
                var base64 =  `data:image/jpg;base64,${data.Body.toString('base64')}`;
                b_imgs[f] = base64;
                if(++num > 3){
                    callback(false, b_imgs);
                }
            })
        })
    },
    //전달 받은 경로의 이미지를 base64로 인코딩 후 해당 파일 삭제
    base64 : (path, callback) => {
        imgConvert.base64(path, (err, imgData) => {
            if(err){
                console.error('retturn buffer base64 errror');
            }
            fs.unlinkSync(path);
            callback(err, imgData);
        })
    },
    //s3에서 전달 받은 키값의 이미지를 가져옴
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
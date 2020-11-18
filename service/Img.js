const {practice} = require('../modules/S3');
const fs = require('fs');
const imgConvert = require('base64-img');
const service = {
    //s3 파일들을 다운로드 받아 base64문자열로 인코딩 후 client에게 전송
    //**1. 비동기 완료 횟수를 체크 변수, 응답할 odject생성
    //**2. fs write stream과 s3 read stream 생성 하고 둘을 연결
    //**3. 각 stream 종료 후 해당 파일을 base64로 인코딩하여 변수에 저장
    //**4. 모든 stream 종료 후 callback 함수 호출
    //**5. 임시 디렉토리에 저장된 파일들 삭제
    s3Base64 : (paths, callback) => {
        /**1 */
        let num = 0;
        let b_imgs = {};
        try{
            Object.keys(paths).forEach(f => {
                /**2 */
                const path = `public/images/Reserve/${paths[f]}`;
                var file_stream = fs.createWriteStream(path);
                var s3_stream = practice.stream(paths[f]);
                s3_stream.on('error', function(err) {
                    console.error(err);
                });
                s3_stream.pipe(file_stream).on('error', function(err) {
                    console.error(err);
                }).on('close', function() {
                    /**3 */
                    num++;
                    b_imgs[f] = imgConvert.base64Sync(path);
                    /**4 */
                    if(num > 3){
                        callback(false, b_imgs);
                        /**5 */
                        Object.keys(paths).forEach( f => {
                            fs.unlink(`public/images/Reserve/${paths[f]}`, (err) => {
                            err ? console.error(err) : console.log('delete Complete');
                            });
                        })
                    }
                });
            })
        }catch(err){
            console.error('image s3 base64 forEach error');
            callback(err);
            return;
        }
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
/*
 S3 동작
 업로드, 읽기, 삭제, 스트림, 헤더 정보 읽기, 부분 스트림
*/
const aws = require("aws-sdk");
aws.config.loadFromPath(__dirname + "/../config/aws_config.json");
const s3 = new aws.S3();
const bucket = require("./configs/bucket.json"); //버킷 정보

//s3기본 동작
const practice = {
    //범위 스트림 리턴
    rangeStream : (key, range) => {
        const params = {
            Bucket : bucket.video_bucket,
            Key : key,
            Range : range,
        }
        return s3.getObject(params).createReadStream();
    },

    //업로드
    upload : (key, file, callback) => {
        const params = {
            Bucket : bucket.base,
            Key : key,
            Body : file
        }
        s3.upload(params, (err) => {
            callback(err);
        })
    },

    //읽기
    read : (key, callback) => {
        const params = {
            Bucket : bucket.base,
            Key : key
        }
        s3.getObject(params, (err, data) => {
            callback(err, data);
        })
    },

    //삭제
    delete : (key, callback) => {
        const params = {
            Bucket : bucket.base,
            Key : key
        }
        s3.deleteObject(params, (err) => {
            callback(err);
        })
    },

    //여러개 한번에 삭제
    deletes :(keys, callback) => {
        var params = {
            Bucket: bucket.base, 
            Delete: {
             Objects: keys, 
             Quiet: false
            }
        };
        s3.deleteObjects(params, (err) => {
            callback(err);
        })
    },

    //스트림 리턴
    stream : (key) => {
        const params = {
            Bucket : bucket.base,
            Key : `abandoned/${key}`
        }
        return s3.getObject(params).createReadStream();
    },

    //파일 헤드 정보
    headRead : (key, callback) => {
        const params = {
            Bucket : bucket.video_bucket,
            Key : key
        }
        s3.headObject(params, (err, data) => {
            callback(err, data);
        })
    },
}

module.exports.s3 = s3;
module.exports.bucket = bucket;
module.exports.practice = practice;

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
    upload : async (key, file) => {
        const params = {
            Bucket : bucket.base,
            Key : key,
            Body : file
        }
        try{
            return await s3.upload(params).promise();
        }catch(err){
            throw err;
        }

    },

    //읽기
    read : async (key) => {
        const params = {
            Bucket : bucket.base,
            Key : key
        }
        try{
            return await s3.getObject(params).promise();
        }catch(err){
            throw err;
        }
    },

    //삭제
    delete : async (key) => {
        const params = {
            Bucket : bucket.base,
            Key : key
        }
        try{
            return await s3.deleteObject(params).promise();
        }catch(err){
            throw err;
        }
    },

    //여러개 한번에 삭제
    deletes : async (keys) => {
        const params = {
            Bucket: bucket.base, 
            Delete: {
             Objects: keys, 
             Quiet: false
            }
        };
        try{
            return await s3.deleteObjects(params).promise();
        }catch(err){
            throw err;
        }
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
    headRead : async (key) => {
        const params = {
            Bucket : bucket.video_bucket,
            Key : key
        }
        try{
            return await s3.headObject(params).promise();
        }catch(err){
            throw err;
        }
    },
}

module.exports.s3 = s3;
module.exports.bucket = bucket;
module.exports.practice = practice;

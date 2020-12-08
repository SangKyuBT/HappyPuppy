const aws = require("aws-sdk");
aws.config.loadFromPath(__dirname + "/../config/awsconfig.json");
const s3 = new aws.S3();
const bucket = require("./configs/bucket.json");

//s3기본 동작
const practice = {
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
    read : (key, callback) => {
        const params = {
            Bucket : bucket.base,
            Key : key
        }
        s3.getObject(params, (err, data) => {
            callback(err, data);
        })
    },
    delete : (key, callback) => {
        const params = {
            Bucket : bucket.base,
            Key : key
        }
        s3.deleteObject(params, (err) => {
            callback(err);
        })
    },
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
    stream : (key) => {
        const params = {
            Bucket : bucket.base,
            Key : `abandoned/${key}`
        }
        return s3.getObject(params).createReadStream();
    },
    headRead : (key, callback) => {
        const params = {
            Bucket : bucket.video_bucket,
            Key : key
        }
        s3.headObject(params, (err, data) => {
            callback(err, data);
        })
    },
    rangeStream : (key, range) => {
        const params = {
            Bucket : bucket.video_bucket,
            Key : key,
            Range : range,
        }
        return s3.getObject(params).createReadStream();
    }
}

module.exports.s3 = s3;
module.exports.bucket = bucket;
module.exports.practice = practice;

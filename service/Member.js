const DAO = require('../DAO/Member');
const {practice} = require('../modules/S3');
const fs = require('fs');

const service = {
    getInfo : (email, callback) => {
        DAO.activeInfo(email, (err, result) => {
            if(err){
                console.error('mysql member getInfo error');
            }
            callback(err, result);
        })
    },
    updateNickname : (nickname, email, callback) => {
        DAO.updateNickname(nickname, email, (err) => {
            if(err){
                console.error('error is mysql update profile nickname');
            }
            callback(err);
        })
    },
    getMyEvent : (email, callback) => {
        DAO.selectMyEvent(email, (err, result) => {
            if(err){
                console.error('error is mysql get my select event');
            }
            callback(err, result);
        })
    },
    getMyAbandoned : (email, callback) => {
        DAO.selectMyAbandoned(email, (err, result) => {
            if(err){
                console.error('error is mysql get my select abandoned');
            }
            callback(err, result);
        })
    },
    //member profile image 변경
    //**1. 필요 변수 추출 /
    //**2. s3 업로드 error 발생시 임시 디렉토리의 image 삭제 /
    //**3. profile image upload를 처음하는 member가 아니라면 기존에 있던 image s3에서 삭제 /
    //**4. db update error 발생시 s3에 upload된 image 삭제 /
    //**5. 임시 디렉토리에 있는 image 삭제 /
    updateImage : (file, body, email, callback) => {
        //**1 */
        const bl = Number(body.n),
        insert_key = `member/${file.filename}`,
        delete_key = `member/${body.delete_key}`;
        //**2 */
        practice.upload(insert_key, fs.readFileSync(file.path), (err) => {
            if(err){
                console.error('error is profile images s3 upload');
                fs.unlinkSync(file.path);
                callback(err);
                return;
            }
            console.log(`${email} profile image s3 upload success`);
            //**3 */
            if(!!bl){
                practice.delete(delete_key, (err)=>{
                    if(err){
                        console.error('error is profile images s3 delete');
                    }
                })
            }
            //**4 */
            DAO.updateImage(file.filename, email, (err) => {
                if(err){
                    console.error('error is mysql profile image update');
                    practice.delete(delete_key, (err) =>{
                        if(err){
                            console.error('mysql execution failed because of its failure');
                            return
                        }
                        console.error('mysql execution was successful due to its failure');
                    })
                    callback(err);
                    return
                }
                //**5 */
                console.log(`${email} profile updated success`);
                fs.unlinkSync(file.path);
                callback(err, file.filename);
            })
        })
    },
}

module.exports.service = service;
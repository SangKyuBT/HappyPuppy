const sharp = require('sharp'); 
const {practice} = require('../modules/S3'); 
const fs = require('fs'); 
const DAM = require('../DAM/Event');

//insert, update 필요 변수 추출
//**position에 소수점 혹은 음수가 있으면 false 리턴  */
const createShapParams = (filename, destination, body) => {
    const position = JSON.parse(body.position); //추출할 때 사용될 정보(크기, 좌표)
    let position_error = false;
    Object.keys(position).forEach(f => {
        if(position[f] < 0 || position[f] !== Math.floor(position[f])){
            position_error = true;
        }
    })
    if(position_error){
        return false;
    }
    const form = JSON.parse(body.form), //db에 들어갈 정보들
    name_sharp = `sharp${filename}`, //추출될 이미지 이름 
    path_sharp = destination + name_sharp;//추출 이미지 저장 경로

    return {position : position, form : form, 
    name_sharp : name_sharp, path_sharp : path_sharp};
}

const service = {
    //**1. 필요 변수 추출
    //**2. 추출 과정에서 false가 리턴 됐는지 확인
    //**3. sharp 모듈로 이미지 추출
    //**4. s3에 추출된 이미지 업로드
    //**5. db insert
    //**6. s3에 원본 이미지 업로드
    //**7. 임시 디렉토리에 저장된 파일 삭제
    insert : (file, body, email, callback) => {
        /**1 */
        const p = createShapParams(file.filename, file.destination, body);
        /**2 */
        if(!p){
            callback(`sharp position error : ${position}`);
            return;
        }
        const {position, form, name_sharp, path_sharp} = p;
        /**3 */
        sharp(file.path).extract(position).toFile(path_sharp, (err, info) => {
            if(err){
                console.error('event service insert error');
                callback(err);
                return
            }
            /**4 */
            const key = `event/${name_sharp}`,
            fs_read = fs.readFileSync(path_sharp);
            practice.upload(key, fs_read, (err) => {
                fs.unlinkSync(path_sharp); //추출된 이미지 임시 디렉토리에서 삭제
                if(err){                   //error 발생시 원본 이미지 임시 디렉토리에서 삭제
                    console.error('event sharp image upload error');
                    fs.unlinkSync(file.path);
                    callback(err);
                    return
                }
                /**5 */
                form.email = email;
                form.ev_img = name_sharp;
                DAM.insert(form, (err) => {
                    if(err){
                        console.error('mysql event insert error');
                        fs.unlinkSync(file.path);
                        callback(err);
                        return
                    }
                    /**6 */
                    const key = `event/${file.filename}`,
                    fs_read = fs.readFileSync(file.path);
                    practice.upload(key, fs_read, (err) => {
                        /**7 */
                        fs.unlinkSync(file.path);
                        callback(err);
                        return
                    })
                })
            })
        })
    },
    update : (file, body, email, callback) => {
        //DAM 실행전 까지는 insert와 동일
        //**1. db update */
        //**2. s3 원본 이미지 업로드 */
        //**3. 임시 디렉토리 파일 삭제 */
        //**4. 기존에 있던 파일들 s3에서 삭제 */ 
        const p = createShapParams(file.filename, file.destination, body);
        if(!p){
            callback(`sharp position error : ${position}`);
            return;
        }
        const {position, form, name_sharp, path_sharp} = p;
        sharp(file.path).extract(position).toFile(path_sharp, (err, info) => {
            if(err){
                console.error('event service insert error');
                callback(err);
                return
            }
            const key = `event/${name_sharp}`,
            fs_read = fs.readFileSync(path_sharp);
            practice.upload(key, fs_read, (err) => {
                fs.unlinkSync(path_sharp); //추출된 이미지 임시 디렉토리에서 삭제
                if(err){                   //error 발생시 원본 이미지 임시 디렉토리에서 삭제
                    console.error('event sharp image upload error');
                    fs.unlinkSync(file.path);
                    callback(err);
                    return
                }
                /**1 */
                form.ev_img = name_sharp;
                const update = JSON.parse(body.update);
                DAM.update(form, update.num, email,  (err) => {
                    if(err){
                        console.error('mysql event insert error');
                        fs.unlinkSync(file.path);
                        callback(err);
                        return
                    }
                    /**2 */
                    const key = `event/${file.filename}`,
                    fs_read = fs.readFileSync(file.path);
                    practice.upload(key, fs_read, (err) => {
                        /**3 */
                        fs.unlinkSync(file.path);
                        callback(err);
                        return
                    })
                    /**4 */
                    const delete_keys = [`event/${update.key}`, `event/${update.key.split('sharp')[1]}`];
                    for(let i of delete_keys){
                        practice.delete(i, (err) => {
                            if(err){
                                console.error(`${i} delete failed`);
                            }else{
                                console.log(`${i} delete success`);
                            }
                        })
                    }
                })
            })
        })

    },
    //*** 여기 밑으로는 단순한 DAM connect service***
    selectCalendar : (start, end, callback) => {
        DAM.select(start, end, (err, result) => {
            if(err){
                console.error('mysql event calendar select error');
            }
            callback(err, result);
        })
    },
    selectCarouesl : (start, callback) => {
        DAM.select(start, null, (err, result) => {
            if(err){
                console.error('mysql event carouesl error');
                callback(err, result);
                return;
            }
            callback(err, result.slice(0,8));
        })
    },
    delete : (num, email, callback) => {
        DAM.delete(num, email, (err, reslut) => {
            if(err){
                console.error('mysql event delete error')
            }
            callback(err, reslut);
        })
    }
}

module.exports.service = service;
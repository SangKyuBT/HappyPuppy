/*
 행사 서비스
 이미지 추출, 행사 정보 응답, 행사 업로드, 삭제, 수정
*/
import sharp from "sharp"; //이미지 추출/리사이징
import { practice } from "../modules/S3"; //S3 접속 및 동작 모듈
import fs from "fs"; //파일 시스템
import DAM from "../DAM/EventDAM"; //데이터베이스 엑세스 모듈

class Service {
    /*
     이미지 추출에 대한 좌표값을 확인하고 추출에 필요한 정보를 리턴
     @param filename(string) : 파일 이름
     @param destination(string) : 추출 이미지 저장 경로
     @param body(obj) : 업로드에 필요한 정보, 추출될 좌표 값 객체
     좌표에 소수점, 음수가 존재한다면 false 리턴, 추출에서 에러가 발생하기 때문
    */
    createShapParams(filename, destination, body){
        const position = JSON.parse(body.position); 
        let position_error = false;
        Object.keys(position).forEach(f => {
            if(position[f] < 0 || position[f] !== Math.floor(position[f])){
                position_error = true;
            }
        })

        if(position_error){
            return false;
        }

        const form = JSON.parse(body.form), 
        name_sharp = `sharp${filename}`, 
        path_sharp = destination + name_sharp;

        return {position : position, form : form, 
        name_sharp : name_sharp, path_sharp : path_sharp};
    };

    /*
     행사 정보 DB insert, 이미지 추출, S3업로드
     @param file(obj) : 임시 폴더에 있는 추출될 이미지 정보
     @param body(obj) : 행사 정보 객체, 추출될 좌표 값 객체
     @param email(string) : 세션 이메일
    */
    insert(file, body, email, callback){
        const p = this.createShapParams(file.filename, file.destination, body);
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
                fs.unlinkSync(path_sharp); 
                if(err){                 
                    console.error('event sharp image upload error');
                    fs.unlinkSync(file.path);
                    callback(err);
                    return
                }

                form.email = email;
                form.ev_img = name_sharp;
                DAM.insert(form, (err) => {
                    if(err){
                        console.error('mysql event insert error');
                        fs.unlinkSync(file.path);
                        callback(err);
                        return
                    }
                    
                    const key = `event/${file.filename}`,
                    fs_read = fs.readFileSync(file.path);
                    practice.upload(key, fs_read, (err) => {
                        fs.unlinkSync(file.path);
                        callback(err);
                        return
                    })
                })
            })
        })
    };
    
    /*
     행사 정보 DB update, 이미지 추출, S3업로드 및 최신화
     @param file(obj) : 임시 폴더에 있는 추출될 이미지 정보
     @param body(obj) : 행사 정보 객체, 추출될 좌표 값 객체
     @param email(string) : Authorization 이메일
    */
    update(file, body, email, callback){
        const p = this.createShapParams(file.filename, file.destination, body);
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
                fs.unlinkSync(path_sharp); 
                if(err){                   
                    console.error('event sharp image upload error');
                    fs.unlinkSync(file.path);
                    callback(err);
                    return
                }

                form.ev_img = name_sharp;
                const update = JSON.parse(body.update);
                DAM.update(form, update.num, email,  (err) => {
                    if(err){
                        console.error('mysql event insert error');
                        fs.unlinkSync(file.path);
                        callback(err);
                        return
                    }

                    const key = `event/${file.filename}`,
                    fs_read = fs.readFileSync(file.path);
                    practice.upload(key, fs_read, (err) => {
                        fs.unlinkSync(file.path);
                        callback(err);
                        return
                    })

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

    };

    /*
     start와 end 사이기간에 있는 행사 정보 요청
     @param start(string) : 시작 날짜
     @param end(string) : 끝 날짜
    */
    selectCalendar(start, end, callback){
        DAM.select(start, end, (err, result) => {
            if(err){
                console.error('mysql event calendar select error');
            }
            callback(err, result);
        })
    };

    /*
     start 이후의 행사 정보 요청
     @param start(string) : 시작 날짜
    */
    selectCarouesl(start, callback){
        DAM.select(start, null, (err, result) => {
            if(err){
                console.error('mysql event carouesl error');
                callback(err, result);
                return;
            }
            callback(err, result);
        })
    };

    /*
     행사 정보 삭제 요청
     @param num(number) : 행사 번호
     @param email(string) : Authorization 이메일
    */
    delete(num, email, callback){
        DAM.delete(num, email, (err, reslut) => {
            if(err){
                console.error('mysql event delete error')
            }
            callback(err, reslut);
        })
    };
};

module.exports = new Service();
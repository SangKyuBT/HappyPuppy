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
     이미지 추출, 결과 리턴
     @param path(string) : 추출 대상 이미지 경로
     @param position(obj) : 추출 좌표 정보
     @param path_sharp : 추출 결과 저장 경로
    */
    imgSharp(path, position, path_sharp){
        return new Promise((resolve, reject) => {
            sharp(path).extract(position).toFile(path_sharp, (err, info) => {
                if(err){
                    console.error(err);
                    reject(false);
                }else{
                    resolve(true);
                }
            })
        })
    }
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
    async insert(file, body, email){
        const p = this.createShapParams(file.filename, file.destination, body);
        if(!p){
            console.log(`sharp position error : ${position}`);
            return falsel
        }

        const {position, form, name_sharp, path_sharp} = p;
        const sharp_rs = await this.imgSharp(file.path, position, path_sharp);
        if(!sharp_rs){
            return false;
        }

        let key = `event/${name_sharp}`;
        try{
            await practice.upload(key, fs.readFileSync(path_sharp));
            form.email = email;
            form.ev_img = name_sharp;
            key = `event/${file.filename}`;
            // fs_read = fs.readFileSync(file.path);
            await practice.upload(key, fs.readFileSync(file.path));
            const result = await DAM.insert(form);
            return result;
        }catch(err){
            console.log(err);
            return false;
        }finally{
            fs.unlinkSync(file.path);
            fs.unlinkSync(path_sharp);
        }


    };
    
    /*
     행사 정보 DB update, 이미지 추출, S3업로드 및 최신화
     @param file(obj) : 임시 폴더에 있는 추출될 이미지 정보
     @param body(obj) : 행사 정보 객체, 추출될 좌표 값 객체
     @param email(string) : Authorization 이메일
    */
    async update(file, body, email){
        const p = this.createShapParams(file.filename, file.destination, body);
        if(!p){
            console.log(`sharp position error : ${position}`);
            return false;
        }

        const {position, form, name_sharp, path_sharp} = p;
        const sharp_rs = await this.imgSharp(file.path, position, path_sharp);
        if(!sharp_rs){
            return false;
        }

        let key = `event/${name_sharp}`;
        try{
            await practice.upload(key, fs.readFileSync(path_sharp));
            form.ev_img = name_sharp;
            const update = JSON.parse(body.update);
            key = `event/${file.filename}`;
            // fs_read = fs.readFileSync(file.path);
            await practice.upload(key, fs.readFileSync(file.path));
            const delete_keys = [`event/${update.key}`, `event/${update.key.split('sharp')[1]}`];
            const result = await DAM.update(form, update.num, email);
            try{
                practice.deletes(delete_keys);
            }catch(err){
                console.log(`error is s3 deletes to ${delete_keys}`);
            }
            return result;
        }catch(err){
            console.log(err);
            return false;
        }finally{
            fs.unlinkSync(file.path);
            fs.unlinkSync(path_sharp);
        }

    };

    /*
     start와 end 사이기간에 있는 행사 정보 요청
     @param start(string) : 시작 날짜
     @param end(string) : 끝 날짜
    */
    async selectCalendar(start, end){
        try{
            return await DAM.select(start, end);
        }catch(err){
            console.log(err);
            return false;
        }
    };

    /*
     start 이후의 행사 정보 요청
     @param start(string) : 시작 날짜
    */
    async selectCarouesl(start){
        try{
            return await DAM.select(start);
        }catch(err){
            console.log(err);
            return false;
        }
    };

    /*
     행사 정보 삭제 요청
     @param num(number) : 행사 번호
     @param email(string) : Authorization 이메일
    */
    async delete(num, email){
        try{
            return await DAM.delete(num, email);
        }catch(err){
            console.log(err);
            return false;
        }
    };
};

module.exports = new Service();
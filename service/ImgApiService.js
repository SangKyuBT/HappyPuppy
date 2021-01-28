/*
 이미지 서비스
 S3 이미지 base64 인코딩, 이미지 응답
*/
import { practice } from "../modules/S3"; //S3 모듈
import fs from "fs"; //파일 시스템
import imgConvert from "base64-img"; //이미지 base64 인코딩

class Service{
    /*
     S3에 있는 이미지 base64로 인코딩하여 응답
     @param poster(string) : S3 키
    */
    async s3Base64(poster){
        try{
            const data = (await practice.read(`abandoned/${poster}`)).Body;
            const base64 = `data:image/jpg;base64,${data.toString('base64')}`;
            return base64;
        }catch(err){
            console.error(err);
            return false;
        }
    };
    
    /*
     임시 폴더에 있는 이미지 base64 인코딩하여 응답
     @param path(string) : 임시 디렉토리내의 이미지 위치
    */
    base64(path){
        try{
            return imgConvert.base64Sync(path);
        }catch(err){
            console.error(err);
            return false;
        }finally{
            fs.unlinkSync(path);
        }
    };

    /*
     S3 이미지 응답
     @param key : S3 키
    */
    async getImg(key){
        try{
            return (await practice.read(key)).Body;
        }catch(err){
            console.error(err);
            return false;
        }
    };
};

module.exports = new Service();
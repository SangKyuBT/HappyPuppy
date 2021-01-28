/*
 마이페이지 서비스
 프로필 이미지 변경, 비밀번호 변경, 회원 활동정보 응답
*/
import DAM from "../DAM/MemberDAM"; //데이터베이스 엑세스 모듈
import { practice } from "../modules/S3"; //S3 엑세스 모듈
import { transporter, from } from "../modules/SendMail"; //메일 전송 모듈
import createSecret from "../modules/CreateSecret"; //문자열 암호화 모듈
import fs from "fs";
const delete_time = 900000; //메일 전송 정보 삭제 시간

class Service{
    /*
     회원 프로필 이미지 변경
     s3 업로드 및 기존 파일 삭제 후 DB Update, 임시 디렉토리의 이미지 삭제
     @param file(obj) : 임시 디렉토리에 있는 파일 정보
     @param body(obj) : 프로필 정보 객체
     @param email(string) : 세션 이메일
    */
    async updateImage(file, body, email, callback){
        const bl = Number(body.n),
        insert_key = `member/${file.filename}`,
        delete_key = `member/${body.delete_key}`;
        let upload, result;
        try{
            await practice.upload(insert_key, fs.readFileSync(file.path));
            upload = true;
            !bl || await practice.delete(delete_key);
            await DAM.update('profile_img', [file.filename, email]);
            result = file.filename;
        }catch(e){
            console.error(e);
        }finally{
            fs.unlinkSync(file.path);
            try{
                !upload || practice.delete(delete_key);
            }catch(err){
                console.error(err);
            }
            return result;
        }
    };

    /*
     회원 채널의 정보 응답
     @param email(string) : session email
    */
    async getMyMedias(email){
        const rs = {medias:null, comments:null};
        let err;
        try{
            const medias = await DAM.select('my_medias', [email]);
            rs.medias = medias;
            const arr = [];
            for(let i = 0; i < medias.length; i++){
                arr[i] = medias[i].num;
            }
            if(arr.length > 0){
                const result = await DAM.select('my_comments', [arr]);
                const r_arr = [];
                const p_arr = [];
                const c_arr = [];

                for(let i = 0; i < result.length; i++){
                    if(!result[i].c_target){
                        p_arr.push(result[i]);
                    }else{
                        c_arr.push(result[i]);
                    }
                }

                for(let i = 0; i < p_arr.length; i++){
                    const obj = {comment:p_arr[i]};
                    const arr = [];
                    for(let j = 0; j < c_arr.length; j++){
                        if(c_arr[j].c_target === p_arr[i].num){
                            arr.push(c_arr[j]);
                            c_arr.splice(j-- ,1);
                        }
                    }
                    obj.in_comments = arr;
                    r_arr.push(obj);
                }
                
                const comments = [];
                for(let i = 0; i < medias.length; i++){
                    comments[i] = {title:medias[i].title};
                    comments[i].comments = [];
                    for(let j = 0; j<r_arr.length; j++){
                        if(medias[i].num === r_arr[j].comment.m_target){
                            comments[i].comments.push(r_arr[j]);
                            r_arr.splice(j--, 1);
                        }
                    }
                }
                rs.comments = comments;
            }else{
                rs.comments = arr;
            }
        }catch(e){
            console.error(e);
            err = e;
        }finally{
            return {err, rs};
        }
    };
    
    /*
     인증 메일 전송
     @param email(string) : 대상 이메일
    */
    async sendMail(email){
        let code = 1, result = 0;
        try{
            const member = await DAM.select('member', [email]);
            if(member[0].count > 0){
                const pass_find = {
                    certify_number : createSecret.createCertifyNumber(5, 5),
                    wait_email : email,       
                }  
                const mailOptions = {
                    from : from,
                    to : email,
                    subject : '해피퍼피 이메일 인증번호입니다.',
                    text : "인증번호 : " + pass_find.certify_number
                }
                const key = 'pass_find';
    
                await transporter.sendMail(mailOptions);
                await DAM.insert(key, pass_find);
    
                setTimeout(() => {
                    DAM.delete(key, [email], (err) =>{
                        !err || console.error(err);
                    })
                }, delete_time)
                result = 1;
            }
        }catch(e){
            console.error(e);
            code = 0;
        }finally{
            return {code, result};
        }
    };
    
    /*
     비밀번호 변경
     @param info(obj) : 비밀번호 정보 객체
    */
    async findPass(info){
        const {email, certify_number, password} = info;
        try{
            const result = await DAM.select('pass_find', [certify_number, email]);
            if(result.length < 1){
                throw new Error('password not find');
            }
            const values = [
                {password_data:JSON.stringify(createSecret.encryption(password))},
                email
            ];
            await DAM.update('member', values);
            try{
                await DAM.delete('pass_find', [email]);
            }catch(err){
                console.error(err);
            }   
            return true;
        }catch(e){
            console.error(e);
            return false;
        }
    };
    
    /*
     회원의 행사, 실종반려견 활동의 대략적인 정보 응답
     @param email(string) : 세션 이메일 
    */
    async getInfo(email){
        try{
            const result = await  DAM.select('active_info',  [email]);
            return result;
        }catch(err){
            console.error(err);
            return false;
        }
    };

    /*
     회원 채널의 대략적인 정보 응답
     @param email(string) : 세션 이메일
    */
    async getMediaInfo(email){
        try{
            const result = await DAM.select('channel_info', [email]);
            return result;
        }catch(err){
            console.error(err);
            return false;
        }
    };
    
    /*
     회원 닉네임 변경
     @param nickname(string) : 변경할 닉네임
     @param email(string) : 세션 이메일
    */
    async updateNickname(nickname, email){
        let code = 0;
        try{
            const result = await DAM.select('nickname', nickname);
            if(result[0].count > 0){
                code = 3;
            }else{ 
                await DAM.update('nickname', [nickname, email]);
                code = 1;
            }
        }catch(e){
            console.error(e);
            code = 0;
        }finally{
            return code;
        }
    };
    
    /*
     회원의 행사 활동 정보 응답
     @param email(string) : 세션 이메일
    */
    async getMyEvent(email){
        try{
            const result = await DAM.select('my_events', [email]);
            return result;
        }catch(err){
            console.error(err);
            return false;
        }
    };
    
    /*
     회원의 실종 반려견 활동 정보 응답
     @param email(string) : session email
    */
    async getMyAbandoned(email){
        try{
            const result = await DAM.select('my_abandoneds', [email]);
            return result;
        }catch(err){
            console.error(err);
            return false;
        }
    };
};

module.exports = new Service();
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
    updateImage(file, body, email, callback){
        const bl = Number(body.n),
        insert_key = `member/${file.filename}`,
        delete_key = `member/${body.delete_key}`;

        practice.upload(insert_key, fs.readFileSync(file.path), (err) => {
            if(err){
                console.error('error is profile images s3 upload');
                fs.unlinkSync(file.path);
                callback(err);
                return;
            }

            if(!!bl){
                practice.delete(delete_key, (err)=>{
                    if(err){
                        console.error('error is profile images s3 delete');
                    }
                })
            }

            DAM.update('profile_img', [file.filename, email], (err) => {
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
                console.log(`${email} profile updated success`);
                fs.unlinkSync(file.path);
                callback(err, file.filename);
            })
        })
    };

    /*
     회원 채널의 정보 응답
     @param email(string) : session email
    */
    getMyMedias(email, callback){
        const rs = {medias:null, comments:null};
        DAM.select('my_medias', [email], (err, result) => {
            if(err){
                console.error(err);
                callback(err);
                return;
            }
            rs.medias = result;
            const medias = result;
            const arr = [];
            for(let i = 0; i < result.length; i++){
                arr[i] = result[i].num;
            }
            if(arr.length > 0){
                DAM.select('my_comments', [arr], (err, result) => {
                    if(err){
                        console.error(err);
                        callback(err);
                        return;
                    }
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
                    callback(err, rs);
                })
            }else{
                rs.comments = arr;
                callback(err, rs);
            }
        })
    };
    
    /*
     인증 메일 전송
     @param email(string) : 대상 이메일
    */
    sendMail(email, callback){
        DAM.select('member', [email], (err, result) => {
            if(err || result[0].count < 1){
                !err || console.error(err);
                callback(err, false);
                return;
            }

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
            DAM.insert(key, pass_find, (err) => {
                if(err){
                    console.error(err);
                    callback(err);
                    return
                }

                transporter.sendMail(mailOptions, function(error, info){
                    !error || console.error(error);
                    callback(error, true);
                })
                setTimeout(() => {
                    DAM.delete(key, [email], (err) =>{
                        !err || console.error(err);
                    })
                }, delete_time)
            })
        })
    };
    
    /*
     비밀번호 변경
     @param info(obj) : 비밀번호 정보 객체
    */
    findPass(info, callback){
        const {email, certify_number, password} = info;
        DAM.select('pass_find', [certify_number, email], (err, result)=>{
            if(err || result.length < 1){
                !err || console.error(err);
                callback(err, true);
                return;
            }
            const values = [
                {password_data:JSON.stringify(createSecret.encryption(password))},
                email
            ]
            DAM.update('member', values, (err) => {
                if(err){
                    console.error(err);
                    callback(err);
                    return;
                }
                DAM.delete('pass_find', [email], (err) => {
                    !err || console.error(`error is pass find delete to ${email}`);
                    callback(err);
                })
            })
        })
    };
    
    /*
     회원의 행사, 실종반려견 활동의 대략적인 정보 응답
     @param email(string) : 세션 이메일 
    */
    getInfo(email, callback){
        DAM.select('active_info',  [email], (err, result) => {
            !err || console.error(err);
            callback(err, result);
        })
    };

    /*
     회원 채널의 대략적인 정보 응답
     @param email(string) : 세션 이메일
    */
    getMediaInfo(email, callback){
        DAM.select('channel_info', [email], (err, result) => {
            !err || console.error(err);
            callback(err, result);
        })
    };
    
    /*
     회원 닉네임 변경
     @param nickname(string) : 변경할 닉네임
     @param email(string) : 세션 이메일
    */
    updateNickname(nickname, email, callback){
        const k = "nickname";
        DAM.select(k, nickname, (err, result) => {
            if(err){
                console.error(err);
                callback(err, 0);
                return;
            }
            if(result[0].count > 0){
                callback(err, 3);
                return
            }
            DAM.update('nickname', [nickname, email], (err) => {
                !err || console.error(err);
                callback(err, 1);
            })
        })
    };
    
    /*
     회원의 행사 활동 정보 응답
     @param email(string) : 세션 이메일
    */
    getMyEvent(email, callback){
        DAM.select('my_events', [email], (err, result) => {
            !err || console.error(err);
            callback(err, result);
        })
    };
    
    /*
     회원의 실종 반려견 활동 정보 응답
     @param email(string) : session email
    */
    getMyAbandoned(email, callback){
        DAM.select('my_abandoneds', [email], (err, result) => {
            !err || console.error(err);
            callback(err, result);
        })
    };
};

module.exports = new Service();
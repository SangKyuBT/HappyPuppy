/*
 회원가입 서비스
 메일 전송, 이메일 중복 확인, 회원가입 
*/
import { transporter, from } from "../modules/SendMail"; //메일전송 모듈
import createSecret from "../modules/CreateSecret"; //비밀키 생성 모듈
import DAM from "../DAM/JoinDAM"; //데이터베이스 엑세스 모듈
const delete_time = 900000; //메일 전송 정보 삭제 시간(단위 : ms)

class Service{
    /*
     메일전송 모듈로 인증번호 메일 전송
     @param email(string) : 요청 이메일
    */
    async sendMail(email){
        try{    
            const check_member = await DAM.select('member', [email]);
            if(check_member[0].count > 0){
                return false;
            }

            const join_wait = {
                certify_number : createSecret.createCertifyNumber(5, 5),
                wait_email : email,       
            };  
            const mailOptions = {
                from : from,
                to : email,
                subject : '해피퍼피 이메일 인증번호입니다.',
                text : "인증번호 : " + join_wait.certify_number
            };
            const key = 'join_wait';

            await transporter.sendMail(mailOptions);
            await DAM.insert(key, join_wait);

            setTimeout(() => {
                DAM.delete(key, [email]);
            }, delete_time);

            return true;
            
        }catch(err){
            console.error(err);
            return false;
        }
        
    };

    /* 
     DB에서 해당 이메일이 존재하는지 조회
     @param email(string) : 확인 이메일
    */
    async duplicate(email){
        try{
            return await DAM.select('duplicate_email', [email]);
        }catch(err){
            cosnole.log(err);
            return false;
        }

    };
    
    /*
     회원 가입, 인증번호 확인 후 비밀번호 암호화, DB insert
     @param member_info(obj) : 회원 정보 객체
    */
    async addMember(member_info){
        let member_insert = 0;
        try{
            const join_wait = await DAM.select('join_wait', [member_info.certify_number, member_info.email]);
            if(!join_wait.length){
                throw new Error('join wait not find');
            }
            member_info.password_data = JSON.stringify(createSecret.encryption(member_info.password));
            delete member_info.password;
            delete member_info.certify_number;
            
            const member_profile = await DAM.select('member_profile', [member_info.email]);
            member_profile[0].count || await DAM.insert("member_profile", member_info.email);
            await DAM.insert('member', member_info);
            member_insert = 1;
        }catch(err){
            console.log(err);
        }finally{
            !member_insert || DAM.delete('join_wait', [member_info.email]);
            return member_insert;
        }
    };
}

module.exports = new Service();
const {transporter, from} = require('../modules/SendMail');
const createSecret = require('../modules/CreateSecret');
const delete_time = 900000; //메일 전송 정보 삭제 시간
const DAM = require('../DAM/Join');

const service = {
    /*
     인증 메일 전송
     메일 전송이 후 15분 뒤에 db 삭제
     파라미터 : email = 요청 이메일
    */
    sendMail: (email, callback) => {
        DAM.select('member', [email], (err, result) => {
            if(err || result[0].count > 0){
                !err || console.error(err);
                callback(err, false);
                return;
            }
            const join_wait = {
                certify_number : createSecret.createCertifyNumber(5, 5),
                wait_email : email,       
            }  
            const mailOptions = {
                from : from,
                to : email,
                subject : '해피퍼피 이메일 인증번호입니다.',
                text : "인증번호 : " + join_wait.certify_number
            }
            const key = 'join_wait';
            DAM.insert(key, join_wait, (err) => {
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
    },
    /* 
     이메일 중복 체크
     파라미터 : email = 확인 이메일
    */
    duplicate: (email, callback) => {
        DAM.select('duplicate_email', [email], (err, result) => {
            !err || console.error(err);
            callback(err, !result ? null : result.length);
        })
    },
    /*
     회원 가입
     인증번호 확인 후 비밀번호 암호화, DAM insert
     파라미터: member_info = 회원 정보 객체
    */
    addMember: (member_info, callback) => {
        DAM.select('join_wait', [member_info.certify_number, member_info.email], (err, result) => {
            if(err || !result.length){
                callback(err, true);
                return;
            }
            member_info.password_data = JSON.stringify(createSecret.encryption(member_info.password));
            delete member_info.password;
            delete member_info.certify_number;
            DAM.insert('member', member_info, (err) => {
                if(err){
                    console.error(err);
                    callback(err, false);
                    return;
                }
                DAM.insert("member_profile", member_info.email, (err) => {
                    if(err){
                        console.error(err);
                        DAM.delete('member', [member_info.email], (err) => {
                            !err || console.error(err);
                        })
                    }
                    callback(err, false);
                })
            })
        });
    }
}

module.exports.service = service;







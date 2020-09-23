let express = require('express');
let router = express.Router();
const nodemailer = require('nodemailer');
const createSecret = require('../modules/CreateSecret');

const nodemailer_pass = {
    key: 'a562805863VajRwZ',
    en: '7d4d7730a21c1751bbe8ab',
    tag: '82c3a2eb7bbfd541bfb3c410a4082755',
    nonce: '00a8edb4d68cf9c2a6cb8c19'
}

const vq_pass = createSecret.ventriloquism(nodemailer_pass);

router.post ('/certify-number', function(req, res){
    const email = req.body.email;
    const join_wait = {
        "certify_number" : createSecret.createCertifyNumber(5, 5),
        "wait_email" : email,       
    }  
    //메일 전송객체 생성
    let transporter = nodemailer.createTransport({
        service : 'gmail',
        auth : {
            user : 'wjdruf23123@gmail.com',
            pass : vq_pass //암호화된 패스워드 복호화
        }
    });
    //메일 전송 옵션 생성
    const mailOptions = {
        from : 'wjdruf23123@gmail.com',
        to : email,
        subject : '해피퍼피 이메일 인증번호입니다.',
        text : "인증번호 : " + join_wait.certify_number
    }
    connection.query('insert into join_waits set ?', join_wait , function(err, result){
        if(err){
            //인증번호에 중복이 없다면 메세지1을 다른 에러는 2를 프론트에 전달
            if(err.errno === 1062){
                res.send({
                    'message' : 1
                })
            }else{
                console.log(err);
                res.send({
                    'message' : 2
                })
            }
        }else{
            //에러가 없다면 메일 전송
            transporter.sendMail(mailOptions, function(error, info){
                if(error){ //메일 관련 에러는 3을 전송
                    console.log(error);   
                    res.send({
                        'message' : 3
                    })             
                }else{
                    //메일 전송이 됐다면 0을 전송
                    console.log(info.responce);
                    res.status(200).send({
                            'message' : 0
                    })
                }
            })
        }
    })
})

//폼의 이메일 부분의 blur 발생시 이메일 중복 체크 라우터
//쿼리의 result의 크기를 send
router.get('/duplicate_email', function(req, res){
    const email = req.query.email;
    connection.query("select email from member where email = ?", email, function(err, result){
        if(err){
            console.log(err);
            throw err;
        }
        res.status(200).send({
            'code' : result.length
        });
    })
})

router.post('/input_member', function(req,res){
    let member_info = req.body;
    connection.query("select * from join_waits where certify_number = ? and wait_email = ?", [member_info.certify_number, member_info.email], function(err, reslut){
        if(err){
            console.log(err);
            throw err;
        }else if(reslut.length === 1){
            member_info.password_data = JSON.stringify(createSecret.encryption(member_info.password));
            delete member_info.password;
            delete member_info.certify_number;
            const sql_q = 'delete from join_waits where wait_email = ?; insert into member set ?;';
            console.log(member_info);
            connection.query('insert into member set ?', member_info, function(err, result){
                if(err){
                    console.log(err);
                    throw err
                }else{
                    connection.query('delete from join_waits where wait_email = ?', member_info.email, function(err, result){
                        if(err){
                            console.log(err);
                            throw err
                        }else{
                            console.log('success')
                            res.status(200).send({
                                'message' : 'success'
                            })
                        }
                    })
                }
            })

        }else{
            console.log("failed")
            res.status(200).send({
                'message' : 'failed'
            })
        }
    })
})

module.exports = router;

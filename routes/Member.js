let express = require('express');
let router = express.Router();
const createdToken = require('../modules/CreateToken');
const {service} = require('../service/Member');
const {rsUpload} = require('../modules/Multer');

//member profile image 요청
router.post('/profile', (req, res) => {
    rsUpload(req, res, (err) => {
        if(err){
            console.error('error is profile rsUpload');
            res.status(200).json({code:0, message:'failed'});
            return
        }
        email = createdToken.verifyToken(req.session.tokens).email;
        service.updateImage(req.file, req.body, email, (err, filename) => {
            if(err){
                console.log(err);
                res.status(200).json({code:0, message:'failed'});
                return
            }
          res.status(200).json({code:1, message:'success', item : filename});
        })
    })
})

//member에 대한 대략적인 정보 요청
router.get('/get_info', (req, res) => {
    const email = createdToken.verifyToken(req.session.tokens).email;
    service.getInfo(email, (err, result) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0});
            return;
        }
        res.status(200).json({code:1, item:result});
    })
});
//channel에 대한 대략적인 정보 요청
router.get('/get_channel_info', (req, res) => {
    const email = createdToken.verifyToken(req.session.tokens).email;
    service.getMediaInfo(email, (err, result) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0});
            return;
        }
        res.status(200).json({code:1, result:result});
    })
});
//member 닉네임 변경 요청
router.get('/nickname/:nickname', (req, res) => {
    const nickname = req.params.nickname;
    if(!!nickname && nickname.length <= 15){
        const email = createdToken.verifyToken(req.session.tokens).email;
        service.updateNickname(nickname, email, (err) => {
            if(err){
                console.log(err);
                res.status(200).json({code:0});
                return;
            }
            console.log(`mysql ${email} nickname change success`);
            res.status(200).json({code:1});
        })
    }else{
        res.status(200).json({code:0})
    }
})

//해당 member의 행사 요청
router.get('/get_events', (req, res) => {
    const email = createdToken.verifyToken(req.session.tokens).email;
    service.getMyEvent(email, (err, result) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0});
            return;
        }
        res.status(200).json({code:1, item : result});
    })
})

//해당 member의 실종 반려견 요청
router.get('/get_abandoned', (req, res) => {
    const email = createdToken.verifyToken(req.session.tokens).email;
    service.getMyAbandoned(email, (err, result) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0})
        }
        res.status(200).json({code:1, item:result})
    })
})

//비밀번호 변경 인증번호 요청
router.post('/certify_number', (req, res) => {
    service.sendMail(req.body.email, (err, result) => {
        res.status(200).json({code: err ? 0 : 1, result:result});
    })
})

//비밀번호 변경 요청
router.post('/find_pass', (req, res) => {
    service.findPass(req.body, (err, result) => {
        res.status(200).json({code: err ? 0 : 1, result:result});
    })
})

//회원 미디어관리 정보 요청
router.get('/my_medias', (req, res) => {
    const email = createdToken.verifyToken(req.session.tokens).email;
    service.getMyMedias(email, (err, result) => {
        res.status(200).json({code: err ? 0 : 1, result : result});
    })
})

module.exports = router;

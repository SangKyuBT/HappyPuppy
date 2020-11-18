let express = require('express');
let router = express.Router();
const createdToken = require('../modules/CreateToken');
const {service} = require('../service/Member');
const {rsUpload} = require('../modules/Multer');

//member profile image 변경
router.post('/profile', (req, res) => {
  if(!!req.session.tokens){
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
  }else{
    res.status(200).json({code:0, message:'failed'});
  }

})

//member에 대한 대략적인 정보 전송
router.get('/get_info', (req, res) => {
    // var test ;
    // try{
    //     test = createdToken.verifyToken(req.session);
    //     console.log(test);
    // }catch{
    //     console.log('error')
    //     const token = createdToken.signToken('wjdruf23@naver.com');
    //     // req.session.cookie.expires = 3600000;
    //     req.session.cookie.expires = new Date(Date.now() + 3600000);
    //     req.session.cookie.maxAge = 3600000; 
    //     req.session.tokens = token;
    //     req.session.isLogin = 1;
    //     req.session.reload((err) => {
    //         if(err){
    //             console.log('error is session reload');
    //             return
    //         }
    //         console.log('sessioc reload success');
    //     })
    // }
    if(!!req.session.tokens){
        const email = createdToken.verifyToken(req.session.tokens).email;
        service.getInfo(email, (err, result) => {
            if(err){
                console.log(err);
                res.status(200).json({message:0});
                return;
            }
            res.status(200).json({message:1, item:result});
        })
    }else{
        res.status(200).json({message:0})
    }
});

//member 닉네임 변경
router.get('/nickname/:nickname', (req, res) => {
    const nickname = req.params.nickname;
    if(!!req.session.tokens && !!nickname && nickname.length <= 15){
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

//member가 등록한 행사 응답
router.get('/get_events', (req, res) => {
    if(!!req.session.tokens){
        const email = createdToken.verifyToken(req.session.tokens).email;
        service.getMyEvent(email, (err, result) => {
            if(err){
                console.log(err);
                res.status(200).json({code:0});
                return;
            }
            res.status(200).json({code:1, item : result});
        })
    }else{
        res.status(200).json({code:0})
    }
})

router.get('/get_abandoned', (req, res) => {
    if(!!req.session.tokens){
        const email = createdToken.verifyToken(req.session.tokens).email;
        service.getMyAbandoned(email, (err, result) => {
            if(err){
                console.log(err);
                res.status(200).json({code:0})
            }
            res.status(200).json({code:1, item:result})
        })
    }else{
        res.status(200).json({code:0})
    }
})
module.exports = router;

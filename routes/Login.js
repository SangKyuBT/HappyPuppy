let express = require('express');
let router = express.Router();
const service = require('../service/Login');
const haur = require('../modules/configs/sessionHauer.json');

router.post('/', (req, res) => {
    service.loginService(req.body, (err, result, token) => {
        if(err || !result){
            console.log(err);
            res.status(200).send({message : 0});
            return;
        }
        req.session.cookie.expires = new Date(Date.now() + haur);
        req.session.cookie.maxAge = haur; 
        req.session.tokens = token;
        req.session.isLogined = 1;
        req.session.save(function(){
            res.status(200).send({message : 1})
        })
    })
})

router.post('/naver', (req, res) => {
    service.naverRedirect(req.body.p, (result) => {
        res.status(200).json({result: result});
    })
})

//로그인 요청이 들어오면 여기로 들어올거임
router.get('/callback/:path', (req, res) => {
    service.naverLogin(req.query, (err, response, body) => {
        if(!err && response.statusCode === 200){
            req.session.cookie.expires = new Date(Date.now() + haur);
            req.session.cookie.maxAge = haur; 
            req.session.tokens = body;
            req.session.isLogined  = 2;
            req.session.save(function(){
                res.redirect(`/${req.params.path}`);
            })
        }else{
            res.status(response.statusCode).end();
        }
    })
});

module.exports = router;
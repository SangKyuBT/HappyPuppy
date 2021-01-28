/*
 로그인 라우트
 로그인, 네이버 로그인
*/
import express from "express";
import service from "../service/LoginService";
import haur from "../modules/configs/sessionHauer.json"; //세션 및 토큰 유지시간 기준

const router = express.Router();

/*
 로그인 요청
*/
router.post('/', async (req, res) => {
    const token = await service.loginService(req.body);
    if(!token){
        res.status(200).send({message : 0});
    }else{
        req.session.cookie.expires = new Date(Date.now() + haur);
        req.session.cookie.maxAge = haur; 
        req.session.tokens = token;
        req.session.isLogined = 1;
        req.session.save(function(){
            res.status(200).send({message : 1})
        })
    }
})

/*
 네이버 로그인 url 요청
 @param p(string) : 네이버 로그인 요청시에 view route 위치
*/
router.post('/naver', (req, res) => {
    const result = service.naverLogin(req.body.p);
    res.status(200).json({result});
})

/*
 네이버 로그인 후 페이지 리다이렉트
 @param path(string) : 네이버 로그인 이후 이동할 view route path
*/
router.get('/callback/:path', (req, res) => {
    service.naverLogin(req.query, (err, response, token) => {
        if(!err && response.statusCode === 200){
            req.session.cookie.expires = new Date(Date.now() + haur);
            req.session.cookie.maxAge = haur; 
            req.session.tokens = token;
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
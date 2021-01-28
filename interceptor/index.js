/*
 인터셉터
 인가된 사용자만 요청가능한 url 확인
 세션 갱신 조건 확인 url 확인
*/
const list  = require('./config.json'); //검사할 url 배열(intertsept or unintersept)
const createdToken = require('../modules/CreateToken'); // 토큰 생성
const getEmail = require('../modules/getEmail'); //로그인 루트에 따른 이메일 추출
const haur = require('../modules/configs/sessionHauer.json'); //세션 및 토큰 유지 시간
const {refresh} = require('../modules/NaverApi'); //네이버 접근 토큰 갱신 요청

/*
 인터셉트 하지않고 세션 갱신이 필요없는 요청 검사
 로그인 인가가 필요한 요청 검사
*/
const interceptor = (req, res, next) => {
    const url = req.url;
    const arr = list.intercept;
    const un_arr = list.uninetercept
    const session = !!req.session.tokens;
    let intercept = false
    let reload = false;
    let unintercept = false;

    for(let i = 0; i < un_arr.length; i++){
        if(url.indexOf(un_arr[i]) > -1){
            unintercept =  true;
            break;
        }
    }

    if(!unintercept){
        for(let i = 0; i < arr.length; i++){
            if(url.indexOf(arr[i]) > -1){
                intercept =  true;
                break;
            }
        }

        if(session){
            const time = new Date(req.session.cookie._expires) - new Date();
            if(time < 0){
                reload = false;
            }else if(time < haur/2){
                const email = getEmail(req.session);
                req.session.cookie.expires = new Date(Date.now() + haur);
                if(req.session.isLogined === 1){
                    req.session.tokens = createdToken.signToken(email);
                    req.session.touch();
                }else{
                    const tokens = JSON.parse(req.session.tokens);
                    const refresh_token = tokens.refresh_token;
                    tokens.email_token = createdToken.signToken(email);
                    req.session.tokens = JSON.stringify(tokens);
                    req.session.touch();
                    refresh(refresh_token, (err, res, body) => {
                        if(err || res.statusCode !== 200){
                            console.error(err);
                        }
                        return;
                    })
                }
                reload = true;
            }else{
                reload = true;
            }
        }
    }

    if(!intercept || reload){
        next();
    }else{
        res.status(200).json({code:2, message:'tokens is not find'});
    }
}

module.exports = interceptor;
const list  = require('./config.json');
const createdToken = require('../modules/CreateToken');
const getEmail = require('../modules/getEmail');
const haur = require('../modules/configs/sessionHauer.json');
const {refresh} = require('../modules/NaverApi');

const interceptor = (req, res, next) => {
    const url = req.url;
    const arr = list.intercept;
    const unarr = list.uninetercept
    const session = !!req.session.tokens;
    let intercept = false
    let reload = false;
    let unintercept = false;

    for(let i = 0; i < unarr.length; i++){
        if(url.indexOf(unarr[i]) > -1){
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
                            console.log('error is naver refresh');
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
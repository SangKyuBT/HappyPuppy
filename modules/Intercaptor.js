const intercept_list  = require('../config/interceptorList.json');
const createdToken = require('../modules/CreateToken');

//session touch, token reload, intercept
const interceptor = (req, res, next) => {
    const url = req.url, arr = intercept_list,session = !!req.session.tokens;
    let intercept = false, reload = false;
    for(let i = 0; i < arr.length; i++){
        if(url.indexOf(arr[i]) > -1){
            intercept =  true;
            break;
        }
    }
    if(session){
        const time = new Date(req.session.cookie._expires) - new Date();
        console.log(time);
        if(time < 0){
            reload = false;
        }else if(time < haur/2){
            console.log('session reload');
            const email = createdToken.verifyToken(req.session.tokens).email;
            req.session.cookie.expires = new Date(Date.now() + haur);
            req.session.tokens = createdToken.signToken(email);
            req.session.touch();
            reload = true;
        }else{
            reload = true;
        }
    }
    if(!intercept || reload){
        next();
    }else{
        res.status(200).json({code:2, message:'tokens is not find'});
    }
    
}

module.exports = interceptor;
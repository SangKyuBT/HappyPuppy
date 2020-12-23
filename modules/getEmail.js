/*
 사용자 이메일 추출
*/
const {verifyToken} =  require('./CreateToken'); //토큰 복호화

/*
 로그인 루트에 따른 사용자 이메일 리턴
 @param data(obj) : 로그인 루트와 토큰이 담긴 객체
*/
const getEmail = (data) => {
    let email;
    try{
        switch(data.isLogined){
            case 1 :
                email = verifyToken(data.tokens).email;
                break;
            case 2 :
                const tokens = JSON.parse(data.tokens);
                email = verifyToken(tokens.email_token).email;
                break
            default :
                email = null;
                break
        } 
    }catch{
        email = null;
    }
    return email;
}

module.exports = getEmail; 
const {verifyToken} =  require('./CreateToken');


const getEmail = (session) => {
    let email;
    try{
        switch(session.isLogined){
            case 1 :
                email = verifyToken(session.tokens).email;
                break;
            case 2 :
                const tokens = JSON.parse(session.tokens);
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
/*
 토큰 생성 및 복호화
*/
const jwt = require('jsonwebtoken'); //토큰 생성
const secretObj = require('./configs/jwt'); 
const haur = require('./configs/sessionHauer.json'); //토큰 유지 시간

/*
 토큰 생성
 @param email(string) : 토큰에 들어갈 사용자 이메일
*/
const signToken = (email) => {
    return jwt.sign({'email' : email}, secretObj.secret, { expiresIn : haur})
}

/*
 토큰 복호화
 @param token(string) : 복호화할 토큰 
*/
const verifyToken = (token) => {
    return jwt.verify(token, secretObj.secret);
}

module.exports = {signToken, verifyToken}
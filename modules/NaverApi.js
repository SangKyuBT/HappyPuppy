/*
 네이버 로그인 API
 토큰 요청, 갱신, 삭제, 사용자 정보 요청
*/
const client = require('./configs/naver.json');
const redirect_URI = encodeURI(client.redirect_URI);

/*
 API에 request 수행
 @param item(string) : 요청 uri
 @param callback(function) : 요청이 응답받은 후 동작
*/
const req = (item, callback) => {
    var request = require('request');
    request.get(item, (error, response, body) => {
        callback(error, response, body);
    });
}

/*
 네이버 로그인 사용자 정보 요청
 @param at(string) : access token
 @param callback(function) : 요청이 응답받은 후 동작
*/
const getInfo = (at, callback) => {
    const header = `Bearer ${at}`;
    const url = 'https://openapi.naver.com/v1/nid/me';
    const option = {
        url : url,
        headers: {'Authorization': header}
    }
    req(option, callback);
}

/*
 접근 토큰 갱신 요청
 @param rt(string) : refresh token
 @param callback(function) : 요청이 응답받은 후 동작
*/
const refresh = (rt, callback) => {
    const url = `https://nid.naver.com/oauth2.0/token?grant_type=refresh_token&client_id=${client.id}&client_secret=${client.secret}&refresh_token=${rt}`;
    req(url, callback);
}

/*
 접근 토큰 삭제 요청
 @param at(string) : access token
 @param callback(function) : 요청이 응답받은 후 동작
*/
const deleteToken = (at, callback) => {
    const url = `https://nid.naver.com/oauth2.0/token?grant_type=delete&client_id=${client.id}&client_secret=${client.secret}&access_token=${at}&service_provider=NAVER`;
    req(url, callback);
}

/*
 사용자 페이지 위치를 포함한 네이버 로그인 URL리턴
 @param path(string) : 요청 보내기전 vuejs route 위치
*/
const hrefURL = (path) => {
    const r = encodeURI(client.redirect_URI + path);
    const url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${client.id}&redirect_uri=${r}&state=${client.state}`;
    return url;
}

/*
 네이버 로그인 요청
 @param query(obj) : 네이버에서 보내온 인증 객체
*/
const login = (query) => {
    const code = query.code, state = query.state,
    api_url = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${client.id}&client_secret=${client.secret}&redirect_URI=${redirect_URI}&code=${code}&state=${state}`,
    option = {
        url: api_url,
        headers: {'X-Naver-client-Id':client.id, 'X-Naver-client-Secret': client.secret}
    }
    return option;
}

module.exports = {hrefURL, login, getInfo, refresh, deleteToken};
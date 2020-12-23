/* 
 회원가입, 비밀번호 찾기 메일 전송 
*/
const nodemailer = require('nodemailer'); //메일 전송 모듈
const tran_option = require('../config/mail_config.json'); //메일 config
const transporter = nodemailer.createTransport(tran_option); //메일 전송 객체
const from = tran_option.auth.user;

module.exports.transporter = transporter;
module.exports.from = from;
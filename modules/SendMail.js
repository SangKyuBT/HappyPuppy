/* 
 메일 전송 모듈 
 사용 모듈 : nodemailer, crypto
 nodemailer 설정 및 객체 생성
*/
const nodemailer = require('nodemailer');
const {ventriloquism} = require('./CreateSecret');
const tran_option = require('./configs/vq.json');
const nodemailer_pass = require('./configs/nodemailerPass');

const vq_pass = ventriloquism(nodemailer_pass);
tran_option.auth.pass = vq_pass;
const transporter = nodemailer.createTransport(tran_option);
const from = tran_option.auth.user;

module.exports.transporter = transporter;
module.exports.from = from;
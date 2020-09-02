var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var eventRouter = require('./routes/Event');
var naverRouter = require('./routes/NaverLogin');
var joinRouter = require('./routes/Join');
var loginSuperVisionRouter = require('./routes/LoginSupervision');
let loginRouter = require('./routes/Login');
let relevantRouter = require('./routes/Relevant');

const secretObj = require('./config/jwt');

let mysql = require('mysql');//mysql 모듈
var session = require('express-session'); //세션
var mySQLStore = require('express-mysql-session')(session); //세션 저장소

//connection 생성
let connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',   
  password: 'mysql',
  database: 'puppy'
});

//세션 저장소 생성 및 연결
const sessionOption = {
      clearExpired: true, //만료된 세션을 지울 것인가
      checkExpirationInterval: 60000, //얼마나 자주 만료 된 세션이 지워질 것인가(단위: 밀리 초)
      expiration: 3600000, //모든 세션의 유효한 세션 기간 
      createDatabaseTable: true, //세션 데이터베이스 테이블이 존재하지 않는 경우 생성할지 여부
      connectionLimit: 1, //연결 출을 만들 때 연결 수
      endConnectionOnClose: false, // 저장소가 닫힐 때 데이터베이스 연결을 종료할지 여부
      charset: 'utf8mb4_bin', //문자 셋
      schema: {
          tableName: 'sessions',
          columnNames: {
              session_id: 'session_id',
              expires: 'expires', 
              data: 'data'
          }
      }
}
var sessionStore = new mySQLStore(sessionOption, connection); 

//connect 실패하면 err반환
connection.connect(function (err) {   
  if (err) {     
    console.error('mysql connection error');     
    console.error(err);     
    throw err;   
  } 
});


global.connection = connection; //connection 전역 선언
global.sessionStore = sessionStore // 세션 저장소 전역 선언

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// app.set('trust proxy', 1) // 첫번째 프록시를 신뢰
app.use(session({
  key: 'session_cookie_name',
  secret : secretObj.secret,
  store: sessionStore,
  resave: false, // 클라이언트가 접속할 때마다 SID를 새로 발급할 것인가
  saveUninitialized: false, //세션을 사용하기 전까지는 SID를 발급하지 않도록 하는 옵션, ture면 발급하지 않음
}));

app.use('/api/login_spv', loginSuperVisionRouter);
app.use('/api/event', eventRouter);
app.use('/api/naver_login', naverRouter);
app.use('/api/join', joinRouter);
app.use('/api/login', loginRouter);
app.use('/api/relevant', relevantRouter);
app.use('*',function(req, res, next) { 
  res.sendFile(path.join(__dirname, 'public', 'index.html')); 
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

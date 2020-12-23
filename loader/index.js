/*
 로더
 세션, 인터셉터 및 라우트 주입
*/
const eventRouter = require('../routes/Event'); //행사 라우트
const joinRouter = require('../routes/Join'); //회원 가입 라우트
const loginSuperVisionRouter = require('../routes/LoginSupervision'); //세션 검사 요청 라우트
const loginRouter = require('../routes/Login'); //로그인 라우트
const relevantRouter = require('../routes/Relevant'); //지도 연관 검색, 검색 결과 이미지 요청 라우트
const imgRouter = require('../routes/ImgApi'); //이미지요청 라우트
const abandonedRouter = require('../routes/Abandoned'); //실종 반려견 라우트
const mediaRouter = require('../routes/Media'); //미디어 라우트
const memberRouter = require('../routes/Member'); //마이페이지 라우트
const interceptor = require('../interceptor'); //인터셉터
const {sessionStore, session} = require('../modules/SessionStore'); //세션 스토어
const secretObj = require('../modules/configs/jwt');

const loader = (app) => {
    app.set('trust proxy', 1) 
    app.use(session({ 
        key: 'session_cookie_name',
        secret : secretObj.secret,
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
    }));

    app.use(interceptor); 

    app.use('/api/login_spv', loginSuperVisionRouter);
    app.use('/api/event', eventRouter);
    app.use('/api/login', loginRouter);
    app.use('/api/naver_login', loginRouter);
    app.use('/api/join', joinRouter);
    app.use('/api/relevant', relevantRouter);
    app.use('/api/img', imgRouter);
    app.use('/api/abandoned', abandonedRouter);
    app.use('/api/media', mediaRouter);
    app.use('/api/member', memberRouter);
}

module.exports = loader;

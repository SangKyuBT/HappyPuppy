const eventRouter = require('../routes/Event');
const joinRouter = require('../routes/Join');
const loginSuperVisionRouter = require('../routes/LoginSupervision');
const loginRouter = require('../routes/Login');
const relevantRouter = require('../routes/Relevant');
const imgRouter = require('../routes/ImgApi');
const abandonedRouter = require('../routes/Abandoned');
const mediaRouter = require('../routes/Media');
const memberRouter = require('../routes/Member');
const interceptor = require('../interceptor');
const {sessionStore, session} = require('../modules/SessionStore');
const secretObj = require('../modules/config/jwt');

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

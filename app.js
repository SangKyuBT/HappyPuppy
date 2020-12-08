var express = require('express');
const createError = require('http-errors');
const path = require('path');
const logger = require('morgan');
const loader = require('./loader');

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//세션, 라우터 적용
loader(app);

app.use('*',function(req, res, next) { 
  res.sendFile(path.join(__dirname, 'public', 'index.html')); 
});

//에러 핸들링
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
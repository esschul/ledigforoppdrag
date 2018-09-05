const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const lessMiddleware = require('less-middleware');
const passport = require("passport");
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const indexRouter = require('./routes/index');
const config = require("./config.json");

const app = express();

app.use(lessMiddleware(__dirname + '/public'));
app.use(express.static(__dirname + '/public'));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




passport.use(new LinkedInStrategy({
    clientID: config.client,
    clientSecret: config.secret ,
    callbackURL: config.callback,
    scope: ['r_emailaddress', 'r_basicprofile'],
}, function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
        // To keep the example simple, the user's LinkedIn profile is returned to
        // represent the logged-in user. In a typical application, you would want
        // to associate the LinkedIn account with a user record in your database,
        // and return that user instead.
        return done(null, profile);
    });
}));


app.use('/', indexRouter);

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

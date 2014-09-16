var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');

var session = require('express-session');
var passport = require('passport');

require('./config/passport').passportfx(passport); // pass passport for configuration

//var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();
var server = require('http').Server(app);
app.set('port', process.env.PORT || 3000);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(session({
    resave:true,
    saveUninitialized:true,
    secret: 'keyboard cat',
    name: 'jsessionid'
}));
app.use(flash());

// Initialize Passport!
// passport.session() middleware for
// persistent login sessions
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res){
    console.log('sessionid: ' + req.sessionID + ' jsessionid' + req.cookies['jsessionid']);
    res.render('index', { user: (typeof(req.user) == 'undefined' ? false : req.user) });
});


app.get('/account', ensureAuthenticated, function(req, res){
    res.render('account', { user: req.user });
});


app.get('/login', function(req, res){
    res.render('login', { user: req.user, message: req.flash('error') });
});


var regenFlag = 0;
app.get('/regenSess', function(req, res){
    if (regenFlag === 0) {
        req.session.regenerate(function(err) {
            console.log('Regenerated sessionid: ' + req.sessionID  + ' jsessionid' + req.cookies['jsessionid']);
            res.render('login', { user: req.user, message: req.flash('error') });
        });
        regenFlag = 1;
    } else {
        res.render('login', { user: req.user, message: req.flash('error') });
    }
});

// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login

// POST /login
//   This is an alternative implementation that uses a custom callback to
//   acheive the same functionality.

app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err) }
        if (!user) {
            req.flash('error', info.message);
            return res.redirect('/login')
        }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.redirect('/');
        });
    })(req, res, next);
});


app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
}



//var routes = require('./routes/index');
//app.use('/', routes);
//app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + server.address().port)
});

//module.exports.app = app;
//module.exports.passport = passport;
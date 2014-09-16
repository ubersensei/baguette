var express = require('express');
var router = express.Router();
var passport = require('passport');


router.get('/', function (req, res) {
    console.log('sessionid: ' + req.sessionID + ' jsessionid' + req.cookies['jsessionid']);
    res.render('index', { user: (typeof(req.user) == 'undefined' ? false : req.user) });
});


router.get('/account', ensureAuthenticated, function (req, res) {
    res.render('account', { user: req.user });
});


router.get('/login', function (req, res) {
    res.render('login', { user: req.user, message: req.flash('error') });
});


router.get('/regenSess', function (req, res) {
    req.session.regenerate(function (err) {
        console.log('Regenerated sessionid: ' + req.sessionID + ' jsessionid' + req.cookies['jsessionid']);
        res.render('login', { user: req.user, message: req.flash('error') });
    });
});

// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login

router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err)
        }
        if (!user) {
            req.flash('error', info.message);
            return res.redirect('/login')
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.redirect('/');
        });
    })(req, res, next);
});


router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login')
}

module.exports = router;

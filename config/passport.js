
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const connection = require('./database');
const User = connection.models.User;
const Admin = connection.models.Admin;
const validPassword = require('../lib/passwordUtils').validPassword;

const customFields = {
    usernameField: 'uname',
    passwordField: 'pw',
    passReqToCallback: true
};

const verifyCallback = (req,username, password, done) => {
    req.checkBody('uname', 'Invalid email').notEmpty().isEmail();
    req.checkBody('pw', 'Invalid password').notEmpty().isLength({min:4});
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
           messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    User.findOne({ username: username })
        .then((user) => {

            if (!user) { return done(null, false,req.flash('error', 'Username or password is wrong')) }

            const isValid = validPassword(password, user.hash, user.salt);

            if (isValid) {
                return done(null, user);
            } else {
                return done(null, false,req.flash('error', 'Username or password is wrong'));
            }
        })
        .catch((err) => {
            done(err);
        });

}

const verifyCallbackAdmin = (req,username, password, done) => {
    req.checkBody('uname', 'Invalid email').notEmpty().isEmail();
    req.checkBody('pw', 'Invalid password').notEmpty().isLength({min:4});
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
           messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    Admin.findOne({ username: username })
        .then((user) => {

            if (!user) { return done(null, false,req.flash('error', 'Username or password is wrong')) }

            const isValid = validPassword(password, user.hash, user.salt);

            if (isValid) {
                return done(null, user);
            } else {
                return done(null, false,req.flash('error', 'Username or password is wrong'));
            }
        })
        .catch((err) => {
            done(err);
        });

}

const strategy = new LocalStrategy(customFields,verifyCallback);
const strategyAdmin = new LocalStrategy(customFields,verifyCallbackAdmin);

passport.use('localuser',strategy);
 passport.use('adminlocal',strategyAdmin);

passport.serializeUser((user, done) => {
    done(null, {_id:user.id,role:user.role});
});

passport.deserializeUser((login, done) => {
    if (login.role === 'user') {
        User.findById(login, function (err, user) {
            if (user)
                done(null, user);
            else
                done(err, { message: 'User not found' })
        });
    }
    else if (login.role === 'admin') {
        Admin.findById(login, (err, admin) => {
            if (admin)
                done(null, admin);
            else
                done(err, { message: 'Admin not found' })
        });
    }

});

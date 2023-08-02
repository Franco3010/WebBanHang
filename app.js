const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
var passport = require('passport');
var crypto = require('crypto');
var routes = require('./routes');
var adminRoutes = require('./routes/admin');
const connection = require('./config/database');
const Handlebars = require('handlebars')
const {engine} = require('express-handlebars')
const path = require('path')
const flash = require('connect-flash');
var validator = require('express-validator');
const {body} = require('express-validator')
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');

/**
 * -------------- GENERAL SETUP ----------------
 */

// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require('dotenv').config();

// Create the Express application
var app = express();
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(validator());
app.engine('handlebars', engine({ extname: '.hbs', defaultLayout: "main",handlebars: allowInsecurePrototypeAccess(Handlebars)}));
app.set('view engine', 'handlebars');
app.set('views',path.join(__dirname,'resources/views') );
app.use(express.static(path.join(__dirname,'resources/assets/css')))
app.use(express.static(path.join(__dirname,'resources/assets/js')))
app.use(express.static(path.join(__dirname,'resources/assets/scss')))
app.use(express.static(path.join(__dirname,'resources/assets/fonts')))
app.use(express.static(path.join(__dirname,'resources/assets/api')))
app.use(express.static(path.join(__dirname,'resources/assets/php')))
// app.use(express.static(path.join(__dirname,'resources/css')))
// app.use(express.static(path.join(__dirname,'resources/js')))
// app.use(express.static(path.join(__dirname,'resources/fonts')))
// app.use(express.static(path.join(__dirname,'resources/images')))
// app.use(express.static(path.join(__dirname,'resources')))

// app.engine('html', hbs.engine);

// set .html as the default extension

app.use(flash());

/**
 * -------------- SESSION SETUP ----------------
 */

// app.use(bodyParser.json());

app.use(session({
    secret: 'hello',
    resave: false,
    saveUninitialized: true,
    // store: MongoStore.create({ mongoUrl: 'mongodb://localhost/Newtest' }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
    }
}));

/**
 * -------------- PASSPORT AUTHENTICATION ----------------
 */

// Need to require the entire Passport config module so app.js knows about it
require('./config/passport');


app.use(passport.initialize());
app.use(passport.session());



/**
 * -------------- ROUTES ----------------
 */
 app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});
// Imports all of the routes from ./routes/index.js
app.use(routes);
app.use(adminRoutes)


/**
 * -------------- SERVER ----------------
 */

// Server listens on http://localhost:3000
app.listen(3000,()=>{
    console.log('App is running at port 3000')
});








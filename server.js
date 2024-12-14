if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const qrcode = require('qrcode');
const speakeasy = require("speakeasy");

// Intializing our passport
const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id) 
)

// otp global
let otp = 3;
let phone = 3;

// Requiring otp files
const emailOTP = require('./emailotp')
const generate_secret_key = require("./generate_secret_key");
const smsOTP = require('./smsotp')
const checkSMS = require('./checksmsotp')

// Setting users up to a local empty array
const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/css'));

// Routing for home
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})

// Routing for login
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/otpselect',
    failureRedirect: '/login',
    failureFlash: true
}))

// Routing for register
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            secret: generate_secret_key()
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

// Routing for otp selection
app.get('/otpselect', checkAuthenticated, (req, res) => {
    res.render('otpselect.ejs')
})

// Routing for email authentication
app.get('/emailotp', checkAuthenticated, (req, res) => {
    otp = emailOTP(req.user.email)
    res.render('emailotp.ejs')
})

app.post('/emailotp', checkAuthenticated, (req, res) => {
    if (req.body.otp == otp) {
        res.redirect('/')
    }
    console.log("Incorrect Code")
})

// Routing for app authentication
app.get('/appotp', checkAuthenticated, (req, res) => {
    qrcode.toDataURL(req.user.secret.otpauth_url, (e, imageUrl) => {
        if (e) {
            console.error('Error generating QR code:', e);
            return;
        }
       res.render('appotp.ejs', { qr: imageUrl })
    });
})

app.post('/appotp', checkAuthenticated, (req, res) => {
    const isCorrectCode = speakeasy.totp.verify({
        secret: req.user.secret.base32,
        encoding: 'base32',
        token: req.body.otp,
        window: 1
    })
    if (isCorrectCode) {
        res.redirect('/')
    }
    console.log("Incorrect Code")
})

// Routing for SMS authentication
app.get('/smsotp', checkAuthenticated, (req, res) => {
    res.render('smsotp.ejs')
})

app.post('/smsotpsend', checkAuthenticated, (req, res) => {
    phone = req.body.phone
    smsOTP(req.body.phone)
})

app.post('/smsotp', checkAuthenticated, (req, res) => {
    if (checkSMS(req.body.otp, phone)) {
        res.redirect('/')
    }
    console.log("Incorrect Code: " + otp)
})

// Logout function
app.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});

// Middleware functions
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }

    next()
}

app.listen(3000)
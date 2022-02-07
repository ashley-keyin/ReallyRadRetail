if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const passportLocal = require('passport-local');
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const queries = require('./queries');
const pg = require('pg');
const mongodb = require('mongodb');

const pool = new pg.Pool({
    user:'postgres',
    host:'localhost',
    database:'retail_users',
    password:'winston',
    port:5432});

const URI = "mongodb://localhost";
const client = new mongodb.MongoClient(URI);

queries.initializePassport(passport, passportLocal);

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
app.use(express.static('public'));

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.first_name})
})

app.post('/result', checkAuthenticated, async(req, res) => {
    await client.connect();
    let user_email = req.user.email;
    let user_account = await pool.query('SELECT id FROM users WHERE email=$1', [user_email]);
    let keyword = req.body.search;
    let key_result = "%" + req.body.search + "%";
    await pool.query('INSERT into keywords (user_id, keyword) VALUES ($1, $2)', [user_account.rows[0].id, keyword]);
    let query = { id: new RegExp(keyword , "i") };
    let pg_results = await pool.query('SELECT * FROM retail_db WHERE id ILIKE $1', [key_result])
    let mongo_results = await client.db("retail").collection("retail_users").find(query, {projection : {_id : 0 }}).toArray();
    let combined_results = pg_results.rows.concat(mongo_results);
    if(req.body.roles === 'postgres'){
        res.render('results.ejs', {
            results: pg_results.rows.map(results => JSON.stringify(results, null, 2))
    })}else if(req.body.roles === 'mongodb'){
        res.render('results.ejs', {
            results: mongo_results.map(results => JSON.stringify(results, null, 2))
    })}else{
        res.render('results.ejs', {
            results: combined_results.map(results => JSON.stringify(results, null, 2))
        })
    }
    await client.close();
})


app.post('/signup', queries.sendInfo);


app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')    
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/', 
    failureRedirect: '/login',
    failureFlash: true
})) 

app.get('/signup', checkNotAuthenticated, (req, res) => {
    res.render('signup.ejs')    
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        console.log("Auth'd")
        return next();
   }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    return next();    
}

app.listen(3200, function(){
    console.log(process.env.SESSION_SECRET);
    console.log("Running on: http://localhost:3200/")
})
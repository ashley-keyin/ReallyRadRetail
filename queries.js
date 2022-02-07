const bcrypt = require('bcrypt');
const pg = require('pg');
const mongodb = require('mongodb');

//Connect to MongoDB server
const URI = "mongodb://localhost"
const client = new mongodb.MongoClient(URI);

//Connect to Postgres server
const pool = new pg.Pool({
    user:'postgres',
    host:'localhost',
    database:'retail_users',
    password:'winston',
    port:5432});

//Initialize Passport Auth
    function initializePassport(passport, passportLocal){
        passport.use(new passportLocal.Strategy({
            usernameField: "email",
            passwordField: "password"
        },
            
            function(email, password, done) {
                  pool.query('SELECT * FROM users WHERE email=$1', [email], async (err, res)=>{
                    if (err) { return done(err); }
                    if (res.rows.length < 1) {
                      return done(null, false, { message: 'Incorrect email.'});
                    }
                    let user = res.rows[0];
                    if (await bcrypt.compare(password, user.password)) {
                      return done(null, user);
                    }else{
                      return done(null, false, { message: "Incorrect password!" });
                  }})
                }
              ));
        
              passport.serializeUser((user, done) => done(null, JSON.stringify(user)))
              passport.deserializeUser((user, done) => {
                  return done(null, JSON.parse(user))
              })
    }

//Creating Signup user account in database
const sendInfo = async(request, response) => {
    let first_name = request.body.first_name;
    let last_name = request.body.last_name;
    let email = request.body.email;
    let password = request.body.password;
    let encrypt_password = await bcrypt.hash(password, 10);
    let email_results = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if(email_results.rows.length !== 0){
        response.send("<p>error! This email is already associated with an account,<a href='/signup'>use a different email.<a>");
    }else{
        await pool.query('INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)', [first_name, last_name, email, encrypt_password]);
        response.send("<p>Account created!<p><a href='/login'>Back to login!<a>");
    }
}

module.exports ={
    sendInfo,
    initializePassport
};

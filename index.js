if (process.env.NODE_ENV === "development") {
  require('dotenv').config();
}

var express = require('express');
var cors = require('cors');
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;
var TwitterClient = require('twitter');
var config = require('./config')

passport.use(new Strategy({
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    callbackURL: config.tweetsServerUrl + '/login/return'
  },
  function(token, tokenSecret, profile, cb) {
    profile._token = token
    profile._tokenSecret = tokenSecret
    return cb(null, profile);
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

var app = express();

if (process.env.NODE_ENV === "development") {
  // app.use(require('morgan')('combined'));
}

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

var whitelist = [
  'https://tweets.now.sh',
  'https://tweets-dev.now.sh',
  'https://tweets-next.now.sh'
];
if (process.env.NODE_ENV === "development") {
  whitelist.push('http://localhost:5000');
}

var corsOptions = {
  origin: function (origin, callback) {
    if (origin) {
      if (whitelist.indexOf(origin) === -1) {
        callback(new Error('Access not allowed'))
      } else {
        callback(null, true);
      }
    } else {
      callback(null, true);
    }
  },
  credentials: true
}

app.use(cors(corsOptions))
app.use(passport.initialize());
app.use(passport.session());

app.get('/login',
  passport.authenticate('twitter'));

app.get('/login/return',
  passport.authenticate('twitter', { failureRedirect: config.tweetsUrl }),
  function(req, res) {
    res.redirect(config.tweetsUrl);
  });

app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect(config.tweetsUrl);
  });

app.get('/tweets/:id*?',
  function(req, res){
    var user = req.user;
    if (user && user._token && user._tokenSecret) {
      var Twitter = new TwitterClient({
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
        access_token_key: req.user._token,
        access_token_secret: req.user._tokenSecret
      });
      var params = {
        count: 800
      };
      var id = req.params.id;
      if (id > 0) {
        params.max_id = id;
      }
      Twitter.get('statuses/home_timeline', params, function(error, tweets, response) {
        if(error) {
          if(res.headersSent) {
            res.send(error);
          } else {
            res.status(400).send(error);
          }
        }
        res.send(tweets);
      });
    } else {
      res.status(401).send([]);
    }
  });

app.listen(5001, function () {
  console.log('tweets-server started successfully');
});

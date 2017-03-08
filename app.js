var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var flash = require('express-flash');
var mongoose = require('mongoose');
// Session store, to keep users logged in even if server is restarted
var MongoDBStore = require('connect-mongodb-session')(session);

var tasks = require('./routes/tasks');
var auth = require('./routes/auth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var mongo_pw = process.env.MONGO_PW;
var url = 'mongodb://admin:' + mongo_pw + '@localhost:27017/todo?authSource=admin';
var session_url = 'mongodb://admin:' + mongo_pw + '@localhost:27017/todo_sessions?authSource=admin';


app.use(session({
  secret: 'replace me with long random string',
  resave: true,
  saveUninitialized: true,
  store: new MongoDBStore( { url: session_url })
}));


require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());         // This creates an req.user variable for logged in users.
app.use(flash());

mongoose.connect(url);

app.use('/auth', auth);  // Order matters.
app.use('/', tasks);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
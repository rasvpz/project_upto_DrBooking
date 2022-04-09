const http = require('http');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var superAdminRouter = require('./routes/superAdmin');
var clinicAdminRouter = require('./routes/clinicDashBoard');
var doctorsAdminRouter = require('./routes/doctorsDashBoard');
var { create } = require ('express-handlebars');
var app = express();
const MongoStore = require('connect-mongo');
var db = require('./config/connection')
const bodyParser = require('body-parser')
const expressSession = require('express-session')
const expressValidator = require('express-validator')
const oneWeek = 604800000

// view engine setup
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))
// app.use(expressValidator ()) 
app.use(express.static(path.join(__dirname, 'public'), { maxAge : oneWeek }))
app.set('trusty proxy', 1)
const session = {
    secret: 'change this',
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017' }),
    resave: false,
    saveUninitialized: true
}
if(process.env.PORT){
    session.cookie = { secure:true }
}
app.use(expressSession(session))

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
const hbs = create({
  layoutsDir: `${__dirname}/views/layout`,
  extname: `hbs`,
  defaultLayout: 'layout',
  partialsDir: `${__dirname}/views/partials`
});

app.engine('hbs', hbs.engine);
require('dotenv').config();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
db.connect((err)=>{
  if(err) console.log("Connection Failed" + err)
  else console.log("Db Connected")
})
app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use('/superAdmin', superAdminRouter);
app.use('/clinicDashBoard', clinicAdminRouter);
app.use('/doctorsDashBoard', doctorsAdminRouter);
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

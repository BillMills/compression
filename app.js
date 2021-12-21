var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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

// mongodb config and connection //////////////////
mongoose.Promise = global.Promise;
const mongoDB = "mongodb://database/argo"
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  keepAlive: 1,
  connectTimeoutMS: 30000,
  maxPoolSize: 2
};

mongoose.connect(mongoDB, mongooseOptions)
.catch(error => { console.log('mongoose connect error: ', error.message); });

let db = mongoose.connection;
//////////////// end mongo config //////////////////

const Profile = require('./models/profile');
const Profilex = require('./models/profilex');
const zipson = require('zipson')

startDate = new Date('2021-11-01T00:00:00Z')
endDate = new Date('2021-11-02T00:00:00Z')
aggPipeline = [
  {$match:  {date: {$gte: startDate}}},
  {$match:  {date: {$lte: endDate}}},
  {$match: {containsBGC: true}}
]
const query = Profile.aggregate(aggPipeline);

query.exec(function (err, profiles) {
  if (err){
    console.log({"code": 500, "message": "Server error"});
    return;
  }

  // keep only profiles that have at least one of a requested core or bgc measurement
  profiles = profiles.filter(item => (('measurements' in item && item.measurements !== null && (item.measurements.some(elt => Object.keys(elt).length!=0)))) || 
                                     (('bgcMeas' in item && item.bgcMeas !== null && (item.bgcMeas.some(elt => Object.keys(elt).length!=0)))))

  if(profiles.length == 0) {
    console.log({"code": 404, "message": "Not found: No matching results found in database."});
    return;
  }
  
  console.log('n profiles: ', profiles.length)
  console.log('uncompressed: ', Buffer.byteLength(JSON.stringify(profiles)))
  for(i=0; i<profiles.length; i++){
    profiles[i]._id = profiles[i]._id+'x'
    profiles[i].compressed = true
    dx = new Date(profiles[i].date)
    dx.setFullYear(9999)
    profiles[i].date = dx
    if(profiles[i].measurements) profiles[i].measurements = zipson.stringify(profiles[i].measurements, {"detectUtcTimestamps": true, "fullPrecisionFloats": true})
    if(profiles[i].bgcMeas) profiles[i].bgcMeas = zipson.stringify(profiles[i].bgcMeas, {"detectUtcTimestamps": true, "fullPrecisionFloats": true})
    px = new Profilex(profiles[i])
    profiles[i] = px
  }
  Profilex.insertMany(profiles, function(err) {console.log(err)})
  console.log('compressed: ', Buffer.byteLength(JSON.stringify(profiles)))
})

module.exports = app;

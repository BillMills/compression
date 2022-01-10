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
const Profileb = require('./models/profileb');

async function traverse(){
  //for await (const profile of Profile.find({date: {$lt: new Date('2005-01-01T00:00:00Z')}})) {
  for await (const profile of Profile.find({date: {$gte: new Date('2005-01-01T00:00:00Z'), $lt: new Date('2015-01-01T00:00:00Z')}})) {
  //for await (const profile of Profile.find({date: {$gte: new Date('2015-01-01T00:00:00Z')}})) {
    p = profile.toObject()
    if(p.measurements) {
      p.measurements = p.measurements.map(x => measminify(p.station_parameters.concat(p.station_parameters.map(k=>k+'_qc')), x))
    }
    if(p.bgcMeas){
      p.bgcMeas = p.bgcMeas.map(x => measminify(p.bgcMeasKeys.concat(p.bgcMeasKeys.map(k=>k+'_qc')), x))
    }
    Profileb.insertMany([p], function(err) {if(err) console.log(err)})
  }
}
traverse()

bitmask = function(varlist, measurement){
  // varlist: array of measurement keys
  // measurement: a JSON object describing a single level measurement
  // returns a bitmask represented as an array of 32-bit numbers, little-endian
  // ie the least significant bit in bitmask[0] signifies the presence of varlist[0],
  // the least significant bit in bitmask[1] signifies the presence of varlist[32], etc.

  mask = new Array(Math.ceil(varlist.length / 32)).fill(0);

  for (const [key, value] of Object.entries(measurement)) {
    if(value===null || isNaN(value)) continue
    bit = varlist.findIndex((k) => k == key)
    if(bit == -1) console.log(key, value, varlist)
    index = (bit - bit%32)/32 // ie the array index in the bitmask
    bit = bit%32
    mask[index] = mask[index] | (1<<bit)
  }

  return mask
}

measminify = function(varlist, measurement){
  // turn a single measurement object into a values-only array, with values in the order specified by varlist, and value presence indicated by the bitmask in the first array position

  mask = bitmask(varlist, measurement)
  min = [mask]
  for(i=0; i<varlist.length; i++){
    if(measurement.hasOwnProperty(varlist[i]) && !Number.isNaN(measurement[varlist[i]])){
      min.push(measurement[varlist[i]])
    }
  }

  return min
}

module.exports = app;

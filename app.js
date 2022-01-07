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

//aggPipeline = [{$match: {date: {$gt: new Date('2020-01-01T00:00:00Z'), $lte: new Date('2020-04-01T00:00:00Z')}}}, {$match: {date_added: {$lt: new Date('2020-04-01T00:00:00Z')}}}]
//aggPipeline = [{$match: {date: {$gt: new Date('2019-01-01T00:00:00Z'), $lte: new Date('2020-01-01T00:00:00Z')}}}, {$match: {date_added: {$lt: new Date('2020-04-01T00:00:00Z')}}}]
// pipelines = [
//   [{$match: {date: {$lte: new Date('2005-01-01T00:00:00Z')}}}],
//   [{$match: {date: {$gt: new Date('2005-01-01T00:00:00Z'), $lte: new Date('2006-01-01T00:00:00Z')}}}],
//   [{$match: {date: {$gt: new Date('2006-01-01T00:00:00Z'), $lte: new Date('2007-01-01T00:00:00Z')}}}],
//   [{$match: {date: {$gt: new Date('2007-01-01T00:00:00Z'), $lte: new Date('2008-01-01T00:00:00Z')}}}],
//   [{$match: {date: {$gt: new Date('2008-01-01T00:00:00Z'), $lte: new Date('2009-01-01T00:00:00Z')}}}],
//   [{$match: {date: {$gt: new Date('2009-01-01T00:00:00Z'), $lte: new Date('2010-01-01T00:00:00Z')}}}],
//   [{$match: {date: {$gt: new Date('2010-01-01T00:00:00Z'), $lte: new Date('2011-01-01T00:00:00Z')}}}],
//   [{$match: {date: {$gt: new Date('2011-01-01T00:00:00Z'), $lte: new Date('2012-01-01T00:00:00Z')}}}],
//   [{$match: {date: {$gt: new Date('2012-01-01T00:00:00Z'), $lte: new Date('2013-01-01T00:00:00Z')}}}],
//   [{$match: {date: {$gt: new Date('2013-01-01T00:00:00Z'), $lte: new Date('2014-01-01T00:00:00Z')}}}],
//   [{$match: {date: {$gt: new Date('2014-01-01T00:00:00Z'), $lte: new Date('2015-01-01T00:00:00Z')}}}],
//   [{$match: {date: {$gt: new Date('2015-01-01T00:00:00Z'), $lte: new Date('2016-01-01T00:00:00Z')}}}],
//   [{$match: {date: {$gt: new Date('2016-01-01T00:00:00Z'), $lte: new Date('2017-01-01T00:00:00Z')}}}],
//   [{$match: {date: {$gt: new Date('2017-01-01T00:00:00Z'), $lte: new Date('2018-01-01T00:00:00Z')}}}],
//   [{$match: {date: {$gt: new Date('2018-01-01T00:00:00Z'), $lte: new Date('2019-01-01T00:00:00Z')}}}],
//   [{$match: {date: {$gt: new Date('2019-01-01T00:00:00Z'), $lte: new Date('2020-01-01T00:00:00Z')}}}]
// ]

//for(let p=0; p<pipelines.length; p++){
// for (var d = new Date('2005-01-01T00:00:00Z'); d <= new Date('2006-01-01T00:00:00Z'); d.setDate(d.getDate() + 1)) {
//   next = d.setDate(d.getDate() + 1)
//   let query = Profile.aggregate([{$match: {date: {$gte: d, $lt: next}}}]);

//   query.exec(function (err, profiles) {
//     if (err){
//       console.log({"code": 500, "message": "Server error"});
//       return;
//     }

//     // // keep only profiles that have at least one of a requested core or bgc measurement
//     // profiles = profiles.filter(item => (('measurements' in item && item.measurements !== null && (item.measurements.some(elt => Object.keys(elt).length!=0)))) || 
//     //                                    (('bgcMeas' in item && item.bgcMeas !== null && (item.bgcMeas.some(elt => Object.keys(elt).length!=0)))))

//     if(profiles.length == 0) {
//       console.log({"code": 404, "message": "Not found: No matching results found in database."});
//       return;
//     }
    
//     console.log('n profiles: ', profiles.length)
//     console.log('uncompressed: ', Buffer.byteLength(JSON.stringify(profiles)))
//     for(i=0; i<profiles.length; i++){
//       //profiles[i]._id = profiles[i]._id+'x'
//       profiles[i].compressed = true
//       //dx = new Date(profiles[i].date)
//       //dx.setFullYear(9999)
//       //profiles[i].date = dx
//       if(profiles[i].measurements) profiles[i].measurements = profiles[i].measurements.map(x => measminify(profiles[i].station_parameters, x))
//       if(profiles[i].bgcMeas) profiles[i].bgcMeas = profiles[i].bgcMeas.map(x => measminify(profiles[i].bgcMeasKeys.concat(profiles[i].bgcMeasKeys.map(k=>k+'_qc')), x))
//       px = new Profilex(profiles[i])
//       profiles[i] = px
//     }
//     Profilex.insertMany(profiles, function(err) {console.log(err)})
//     console.log('compressed: ', Buffer.byteLength(JSON.stringify(profiles)))
//   })
// }

async function traverse(){
  //for await (const profile of Profile.find({date: {$lt: new Date('2005-01-01T00:00:00Z')}})) {
  //for await (const profile of Profile.find({date: {$gte: new Date('2005-01-01T00:00:00Z'), $lt: new Date('2015-01-01T00:00:00Z')}})) {
  for await (const profile of Profile.find({date: {$gte: new Date('2015-01-01T00:00:00Z')}})) {
    p = profile.toObject()
    p._id = p._id
    dx = new Date(p.date)
    dx.setFullYear(dx.getFullYear() + 1000)
    p.date = dx
    if(p.measurements) {
      p.measurements = p.measurements.map(x => measminify(p.station_parameters, x))
    }
    if(p.bgcMeas){
      p.bgcMeas = p.bgcMeas.map(x => measminify(p.bgcMeasKeys.concat(p.bgcMeasKeys.map(k=>k+'_qc')), x))
    }
    Profilex.insertMany([p], function(err) {console.log(err)})
  }
}
traverse()

measminify = function(varlist, measurement){
  // turn a single measurement object into a values-only array, with values in the order specified by varlist

  min = varlist.map(x => measurement[x]) 
  //console.log(varlist, measurement, min)
  return min
}

module.exports = app;

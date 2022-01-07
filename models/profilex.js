var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

// var measSchema = Schema(
//   {
//     pres: {type: Number, required: false},
//     temp: {type: Number, required: false},
//     psal: {type: Number, required: false}  
//   }, 
//   { _id : false }
// );

var ProfileSchemax = Schema(
  {
    _id: {type: String, required: true},
    nc_url: {type: String, required: true},
    position_qc: {type: Number, required: true},
    cycle_number: {type: Number, required: true},
    dac: {type: String, required: true, max: 100},
    date: {type: Date, required: true},
    date_added: {type: Date, required: false},
    date_qc: {type: Number, required: false},
    max_pres: {type: Number, required: true},
    //measurements: {type: [[mongoose.Mixed]], required: true},
    measurements: Schema.Types.Mixed,
    //measurements: [measSchema],
    // measurements: [{
    //   _id: false,
    //   type: [mongoose.Mixed]
    // }],
    //bgcMeas: [mongoose.Schema.Types.Mixed], // defining schema slows down for large bgcMeas
    //bgcMeas: {type: [[mongoose.Mixed]], required: true},
    bgcMeas: Schema.Types.Mixed,
    bgcMeasKeys: {type: [String], required: false},
    lat: {type: Number, required: true},
    lon: {type: Number, required: true},
    //platform_number: {type: Number, required: true, max: 100},
    platform_number: {type: Number, required: true},
    geoLocation: {type: Schema.Types.Mixed, required: true},
    station_parameters: {type: [String], required: true},
    station_parameters_in_nc: {type: [String], required: false},
    VERTICAL_SAMPLING_SCHEME: {type:String, required: false},
    PI_NAME: {type: String, required: false, max: 100},
    WMO_INST_TYPE: {type: String, required: false, max: 100},
    POSITIONING_SYSTEM: {type: String, required: false, max: 100},
    DATA_MODE: {type: String, required: false, max: 100},
    PARAMETER_DATA_MODE: Schema.Types.Mixed,
    DATA_CENTRE: {type: String, required: false, max: 100},
    DIRECTION: {type: String, required: false, max: 100},
    PLATFORM_TYPE: {type: String, required: false, max: 100},
    pres_max_for_TEMP: {type: Number, required: false},
    pres_max_for_PSAL: {type: Number, required: false},
    pres_min_for_TEMP: {type: Number, required: false},
    pres_min_for_PSAL: {type: Number, required: false},
    containsBGC: {type: Boolean, required: false},
    isDeep: {type: Boolean, required: false},
    BASIN: {type: Number, required: false},
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    versionKey: false
  }
);

// Virtual for profile's URL
ProfileSchemax
.virtual('url')
.get(function () {
  return '/catalog/profiles/' + this._id;
});

ProfileSchemax
.virtual('core_data_mode')
.get(function() {
  let core_data_mode
  if (this.DATA_MODE) {
    core_data_mode = this.DATA_MODE
  }
  else if (this.PARAMETER_DATA_MODE.length > 0) {
    core_data_mode = this.PARAMETER_DATA_MODE[0]
  }
  else {
    core_data_mode = 'Unknown'
  }
  return core_data_mode
})

ProfileSchemax
.virtual('jcommopsPlatform')
.get(function () {
  return 'http://www.jcommops.org/board/wa/Platform?ref=' + this.platform_number
})

ProfileSchemax
.virtual('euroargoPlatform')
.get(function () {
  return 'https://fleetmonitoring.euro-argo.eu/float/'+this.platform_number
})

ProfileSchemax
.virtual('formatted_station_parameters')
.get(function () {
  return this.station_parameters.map(param => ' '+param)
})

ProfileSchemax
.virtual('roundLat')
.get(function () {
  return this.lat.toFixed(3);
});
ProfileSchemax
.virtual('roundLon')
.get(function () {
  return this.lon.toFixed(3);
});

ProfileSchemax
.virtual('strLat')
.get(function () {
  let lat = this.lat;
  if (lat > 0) {
    strLat = Math.abs(lat).toFixed(3).toString() + ' N';
  }
  else {
      strLat = Math.abs(lat).toFixed(3).toString() + ' S';
  }
  return strLat
});

ProfileSchemax
.virtual('strLon')
.get(function () {
  let lon = this.lon;
  if (lon > 0) {
    strLon = Math.abs(lon).toFixed(3).toString() + ' E';
  }
  else {
      strLon = Math.abs(lon).toFixed(3).toString() + ' W';
  }
  return strLon
});

// Virtual for formatted date
ProfileSchemax
.virtual('date_formatted')
.get(function () {
  return moment.utc(this.date).format('YYYY-MM-DD');
});

//Export model, mongoose automatically looks for the plural of the first input. 'profiles'
module.exports = mongoose.model('profilesx', ProfileSchemax, 'profilesx');
//module.exports = mongoose.model('goship', ProfileSchema, 'goship');

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var documentLinkSchema = new Schema({
  title: String,
  url: String,
  format: String,
  categoryCodes: [String]
});

var orgRefSchema = new Schema({
  name: String,
  role: String,
  type: Number,
  ref: String
});

var locationSchema = new Schema({
  name: String,
  description: String,
  coordinates: {
    latitude: String,
    longitude: String,
    precision: Number
  },
  administrative: {
    country: String,
    adm1: String,
    adm2: String,
    adm3: String,
    adm4: String,
    adm5: String
  }
});
locationSchema.methods.fullAdm = function(separator) {
  if (!separator)
    separator = ', ';

  var output = '';
  for (i=5; i>=1; i--) {
    key = 'adm' + i;
    value = this.administrative[key];
    if (value)
      output += value + ', ';
  }

  output += require('./countrycodes')[this.administrative.country];

  return output;
};

relatedActivitySchema = new Schema({
  type: String,
  ref: {
    type: String,
    ref: 'Activity'
  }
});

var activitySchema = new Schema({
  _id: String,
  title: String,
  description: String,
  iatiId: String,
  status: String,
  documentLinks: [documentLinkSchema],
  participatingOrgs: [orgRefSchema],
  reportingOrgs: [orgRefSchema],
  locations: [locationSchema],
  relatedActivities: [relatedActivitySchema],
  _rawJSON: String
});

activitySchema.virtual('_raw')
.get(function() {
  return JSON.parse(_rawJSON);
})
.set(function(v) {
  this._rawJSON = JSON.stringify(v);
});

activitySchema.statics.generateIdFromIatiId = function(iatiId) {
  // return 'iati-registry:' + iatiId;
  return iatiId;
}
activitySchema.methods.setIdFromIatiId = function() {
  this._id = activitySchema.statics.generateIdFromIatiId(this.iatiId);
}
activitySchema.statics.findByIatiId = function(iatiId, cb) {
  this.findById(this.generateIdFromIatiId(iatiId), cb);
}

var reportSchema = new Schema({
  generatedDateTime: String,
  activities: [activitySchema],
  _rawJSON: String
});

reportSchema.virtual('_raw')
.get(function() {
  return JSON.parse(_rawJSON);
})
.set(function(v) {
  this._rawJSON = JSON.stringify(v);
});

var Activity = exports.Activity = mongoose.model('Activity', activitySchema);
var Report = exports.Report = mongoose.model('Report', reportSchema);
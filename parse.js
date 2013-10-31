var fs = require('fs'),
    xml2js = require('xml2js');

xml2jsParser = new xml2js.Parser();

// Convert xml2js to a more IATI-specific JSON format.
parse = function(data) {
  root = data['iati-activities'];

  report = {};
  report.generatedDateTime = root['$']['generated-datetime'];

  rawActivities = root['iati-activity'];
  activities = [];

  rawActivities.forEach(function(data) {
    activity = {
      title: data.title[0]['_'],
      description: data.description[0]['_'],
      iatiId: data['iati-identifier'][0],
      status: null,
      documents: [],
      participatingOrgs: [],
      reportingOrgs: [],
      locations: []
    };

    if (data['activity-status'])
      activity.status = data['activity-status'][0]['_'];

    if (data['location'])
      data['location'].forEach(function(data) {
        loc = {
          name: data.name[0],
          description: data.name[0],
          coordinates: data.coordinates
          // {
          //   latitude: data.coordinates['$'].latitude,
          //   longitude: data.coordinates['$'].longitude
          // }
        }

        activity.locations.push(loc);
      });

    if (data['document-link'])
      data['document-link'].forEach(function(data) {
        doc = {
          title: data.title[0],
          url: data['$'].url,
          format: data['$'].format,
          categories: []
        };

        data.category.forEach(function(data) {
          cat = {
            name: data['_'],
            code: data['$'].code
          }
          doc.categories.push(cat);
        });

        activity.documents.push(doc);
      });

    if (data['participating-org'])
      data['participating-org'].forEach(function(data) {
        org = {
          name: data['_'],
          role: data['$'].role,
          type: data['$'].type,
          ref: data['$'].ref
        }

        activity.participatingOrgs.push(org);
      });

    if (data['reporting-org'])
      data['reporting-org'].forEach(function(data) {
        org = {
          name: data['_'],
          role: data['$'].role,
          type: data['$'].type,
          ref: data['$'].ref
        }

        activity.participatingOrgs.push(org);
      });

    activities.push(activity);
  });

  report.activities = activities;

  return report;
}

parseFile = module.exports = function(fileName, handler) {
  fs.readFile(fileName, function(err, data) {
    if (err)
      handler(err);
    else
      xml2jsParser.parseString(data, function(err, data) {
        if (err)
          handler(err);
        else
          handler(null, parse(data));
      });
  })
}
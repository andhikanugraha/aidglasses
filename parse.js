var fs = require('fs'),
    xml2js = require('xml2js');

xml2jsParser = new xml2js.Parser();

parseActivity = function(data) {
  activity = {
    title: data.title[0]['_'],
    description: data.description[0]['_'],
    iatiId: data['iati-identifier'][0],
    status: null,
    documentLinks: [],
    participatingOrgs: [],
    reportingOrgs: [],
    locations: [],
    _raw: data
  };

  if (data['activity-status'])
    activity.status = data['activity-status'][0]['_'];

  if (data['location'])
    data['location'].forEach(function(data) {
      loc = {
        name: data.name[0],
        description: data.name[0],
        coordinates: data.coordinates[0]['$'],
        administrative: data.administrative[0]['$']
      }

      activity.locations.push(loc);
    });

  if (data['document-link'])
    data['document-link'].forEach(function(data) {
      doc = {
        title: data.title[0],
        url: data['$'].url,
        format: data['$'].format,
        categoryCodes: []
      };

      data.category.forEach(function(data) {
        doc.categoryCodes.push(data['$'].code);
      });

      activity.documentLinks.push(doc);
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

      activity.reportingOrgs.push(org);
    });

  return activity;
}

parseActivities = function(root) {
  rawActivities = root['iati-activity'];
  activities = [];

  rawActivities.forEach(function(data) {
    activities.push(parseActivity(data));
  });

  return activities;
}

// Convert xml2js to a more IATI-specific JSON format.
parse = function(data) {
  var report = {};

  for (root in data) {
    report.generatedDateTime = data[root]['$']['generated-datetime'];

    switch (root) {
      case 'iati-activities':
        report.activities = parseActivities(data[root]);
        break;
    }

    break;
  }

  report._raw = data;

  return report;
}

parseString = exports.fromString = parse;

parseFile = exports.fromFile = function(fileName, handler) {
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

parseSample = exports.fromSample = function(handler) {
  fs.readFile('./sample.json', function(err, eee) {
    if (err)
      handler(e);
    else {
      obj = JSON.parse(eee);
      handler(null, parse(obj));
    }
  })
}
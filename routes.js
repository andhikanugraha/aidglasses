var async = require('async'),
    parse = require('./parse'),
    models = require('./models');

var Activity = models.Activity;

module.exports = function(app) {
  var config = require('./config')[app.get('env')];

  processDoc = function(data, done) {
    // data: parsed JSON form of IATI document
    // f.s. data is entered into db

    activities = data.activities;

    async.map(activities, function(activity, done) {
      _id = Activity.generateIdFromIatiId(activity.iatiId);

      // Remove any existing activity
      Activity.remove({iatiId: activity.iatiId}, function(err) {
        if (err)
          done(err);
        else {
          doc = new Activity(activity);
          doc.setIdFromIatiId();

          doc.save(function(err, doc) {
            if (err)
              done(err);
            else
              done(null, doc);
          });
        }
      });
    }, done);
  }

  // Define routes below

  app.get('/', function (req, res) {
    res.render('home', {title: "Hello"});
  });

  app.post('/', function(req, res) {
    if (src = req.files.source)
      parse.fromFile(src.path, function(err, data) {
        if (err) {
          res.render('home', {error: err});
        }
        else {
          processDoc(data, function(err, data) {
            if (err) {
              res.render('home', {error: err});
            }
            else {
              res.render('uploaded', { numRecords: data.length });
            }
          })
        }
      });
    else
      res.render('home', {error: 'Upload failed'});
  });

  app.get('/activity/:id', function(req, res) {
    Activity.findById(req.params.id, function(err, activity) {
      res.render('viewActivity', {error: err, activity: activity});
    })
  });

  app.get('/test', function(req, res) {
    try {
      parse.fromSample(function(err, data) {
        if (err) {
          console.log(err);
          res.render('home', {error: err});
        }
        else {
          res.render('results', { report: data });
        }
      });
    }
    catch (e) {
      res.render('home', {error: e});
    }
  });

  app.get('/activities', function(req, res) {
    Activity.find().lean().exec(function(err, data) {
      res.render('activities', {activities: data});
    })
  })

  app.get('/mt', function(req, res) {
    parse.fromSample(function(err, data) {
      if (err) {
        res.render('home', {error: err});
      }
      else {
        processDoc(data, function(err, dt) {
          if (err) {
            res.render('home', {error: err});
          }
          else {
            res.render('results', { report: data });
          }
        })
      }
    })
  })
}
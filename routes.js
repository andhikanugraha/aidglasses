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

  app.get('/activities', function(req, res) {
    Activity.find().lean().exec(function(err, data) {
      res.render('activities', {activities: data});
    })
  });

  app.get('/activity/:id', function(req, res) {
    Activity.findById(req.params.id, function(err, activity) {
      async.map(activity.relatedActivities, function(ra, done) {
        if (ra.ref) {
          Activity.findById(ra.ref, 'title').lean()
          .exec(function(err, doc) {
            if (err)
              done(err);
            else {
              ra.title = doc.title;
              done(null, ra);
            }
          })
        }
        else
          done(null);
      }, function(err, relatedActivities) {
        if (err)
          console.log(err);
        if (!err)
          activity.relatedActivities = relatedActivities;
      });

      res.render('viewActivity', {error: err, activity: activity});
    })
  });

  app.get('/purge', function(req, res) {
    res.render('purge');
  });

  app.post('/purge', function(req, res) {
    Activity.remove({}, function(err) {
      if (err)
        res.render('purge', {error: err});
      else
        res.render('purge', {success: true});
    });
  });

  // -- only for dev --

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
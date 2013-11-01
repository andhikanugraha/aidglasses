var express = require('express'),
    exphbs  = require('express3-handlebars'),
    mongoose = require('mongoose'),
    routes = require('./routes'),
    // eyes = require('eyes'),

    app = express(),
    config = require('./config')[app.get('env')];

var store = {};

mongoose.connect(config.db);

app.engine('handlebars', exphbs({defaultLayout: 'main', helpers: require('./helpers')}));
app.set('view engine', 'handlebars');

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static('public/'));

if (app.get('env') == 'development')
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

routes(app);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', function() {
  app.listen(config.port);
  console.log('AidGlasses running in ' + app.get('env') + ' mode on port ' + config.port + '.');
});
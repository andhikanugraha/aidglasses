var express = require('express'),
    exphbs  = require('express3-handlebars'),
    parse = require('./parse'),
    // eyes = require('eyes'),

    app = express(),
    config = require('./config')[app.get('env')];

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.bodyParser());
app.use(express.methodOverride());

app.get('/', function (req, res) {
  res.render('home', {title: "Hello"});
});

app.post('/', function(req, res) {
  try {
    if (src = req.files.source)
      parse.fromFile(src.path, function(err, data) {
        if (err)
          throw err;
        else
          res.render('results', { report: data });
      });
    else
      throw 'Upload failed';
  }
  catch (e) {
    res.render('home', {error: e})
  }
});

app.use(express.static('public/'));
app.listen(config.port);

console.log('AidGlasses running in ' + app.get('env') + ' mode on port ' + config.port + '.');

// var inspect = require('eyes').inspector({ maxLength: 4096 });

// parse('Indonesia_projects.xml', function(err, data) {
//   inspect(data);
// })

// fs.readFile('Indonesia_projects.xml', function(err, data) {
//   xml2jsParser.parseString(data, function(err, data) {
//     // parsed = parse(data);
//     inspect(data['iati-activities']['iati-activity'][0]);
//     inspect(parse(data));
//   })
// });
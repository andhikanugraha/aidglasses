var express = require('express'),
    exphbs  = require('express3-handlebars'),
    parse = require('./parse'),
    // eyes = require('eyes'),

    app = express(),
    config = require('./config')[app.get('env')];

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    res.render('home', {title: "Hello"});
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
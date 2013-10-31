var parse = require('./parse'),
    eyes = require('eyes');

var inspect = require('eyes').inspector({ maxLength: 4096 });

parse('Indonesia_projects.xml', function(err, data) {
  inspect(data);
})

// fs.readFile('Indonesia_projects.xml', function(err, data) {
//   xml2jsParser.parseString(data, function(err, data) {
//     // parsed = parse(data);
//     inspect(data['iati-activities']['iati-activity'][0]);
//     inspect(parse(data));
//   })
// });
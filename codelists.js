var fs = require('fs'),
    async = require('async'),
    xml2js = require('xml2js');

var xml2jsParser = new xml2js.Parser();

var codelists = {};

parseCodelist = function(fileName, done) {
  fs.readFile(fileName, function(err, data) {
    if (data) {
      xml2jsParser.parseString(data, function(err, data) {
        if (err)
          throw err;
        else {
          name = data.codelist['$'].name;
          codes = {};
          data.codelist[name].forEach(function(data) {
            code = data.code[0];
            listing = {};

            if (data.name)
              listing.name = data.name[0];
            if (data.description)
              listing.description = data.description[0];
            if (data.category)
              listing.category = data.category[0];
            if (data['category-name'])
              listing.categoryName = data['category-name'][0];

            codes[code] = listing;
          });

          codelists[name] = codes;

          done();
        }
      });
    }
    else
      throw err;
  })
}

parseCodelists = function(done) {
  fs.readdir('./codelists', function(err, files) {
    var queue = [];

    files.forEach(function(fileName) {
      if (fileName.match(/\.xml$/))
        queue.push(parseCodelist.bind(undefined, './codelists/' + fileName));
    });

    async.series(queue, function() {
      contents = JSON.stringify(codelists);
      fs.mkdir('./data', function() {
        fs.writeFile('./data/codelists.json', contents, function() { done() });
      });
    });

    done(codelists);
  });
}

async.series([
  function(done) {
    fs.readFile('data/codelists.json', function(err, data) {
      if (err) {
        // file doesn't exist. generate the file.
        parseCodelists(function(cl) {
          codelists = cl;
          done();
        });
      }
      else {
        codelists = JSON.parse(data);
        done();
      }
    })
  }
], function() {
  exports.codelists = codelists;
});

getName = exports.getName = function(codelistName, code) {
  return codelists[codelistName][code].name;
};
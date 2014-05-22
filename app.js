var express = require('express'),
    MongoClient = require('mongodb').MongoClient;

// Create the Express application
var app = module.exports = express();

app.configure(function() {
  app.use("/static", express.static(__dirname + '/static'));

  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.set('views', __dirname + '/static/views/');

  app.use(app.router);
});

app.get("/", function(req, res, next) {
  res.render("index");
});

app.get("/murals/:id", function(req, res, next) {
  withDb(function(db) {
    db.collection('murals').findOne({ _id: req.params.id }, function(err, one) {
      if(err) return next(err);

      res.send(one);
    });
  });
});

function withDb(done) {
  MongoClient.connect('mongodb://127.0.0.1:27017/html5devconf2014', function(err, db) {
    if(err) throw err;

    return done(db);
  });
}

app.listen(process.env.PORT || 4001, function() {
    console.log("Server running in %s mode", app.settings.env);
});

var express = require('express'),
    MongoClient = require('mongodb').MongoClient;

var env = process.env;
var Pusher = require('pusher');
var pusher = new Pusher({ appId: env.PUSHER_APP_ID, key: env.PUSHER_APP_KEY, secret: env.PUSHER_APP_SECRET });

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
  res.render("index", { pusherKey: process.env.PUSHER_APP_KEY });
});

app.get("/murals/:id", function(req, res, next) {
  withDb(function(db) {
    db.collection('murals').findOne({ _id: req.params.id }, function(err, one) {
      if(err) return next(err);

      res.send(one);
    });
  });
});

app.post("/murals/:id", function(req, res, next) {
  var id = req.params.id;
  var values = generateValues(req.body);

  withDb(function(db){
    db.collection('murals').update({ _id: id }, values, function(err) {
      if (err) return next(err);

      pusher.trigger('html5devconf2014', 'operation', req.body, req.body.socketId, function() {
        res.send(200);
      });
    });
  });
});

function generateValues(operation) {
  switch (operation.action) {
    case 'update':
      var key = 'widgets.' + operation.widget + '.' + operation.property;

      var values = { $set: {} }
      values['$set'][key] = operation.value;

      return values;
  };
};

function withDb(done) {
  MongoClient.connect('mongodb://127.0.0.1:27017/html5devconf2014', function(err, db) {
    if(err) throw err;

    return done(db);
  });
}

app.listen(process.env.PORT || 4001, function() {
    console.log("Server running in %s mode", app.settings.env);
});

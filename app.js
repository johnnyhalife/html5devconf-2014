var express = require('express');

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

app.listen(process.env.PORT || 4001, function() {
    console.log("Server running in %s mode", app.settings.env);
});

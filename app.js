var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongo = require('mongodb');
var monk = require('monk');


var mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nodetest1';
var db = monk(mongoUri);

var shortid = require('shortid');
var validUrl = require('valid-url');

var routes = require('./routes/index');
// var urls = require('./routes/urls');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
    req.db = db;
    next();
});




app.use('/', routes);
// app.use('*', urls);
app.get('/new/*', function(req, res, next) {
  console.log(req.url.substr(5));
  var newShortId = shortid.generate();
  var insertThis = {
    url: req.url.substr(5),
    shortid:newShortId,
    short_url:'https://bcd-fcc-urls.herokuapp.com/'+newShortId
  };
  console.log(insertThis);
  if (validUrl.isUri(insertThis.url)){

    var db = req.db;
    var collection = db.get('urlcollection');


    collection.insert(insertThis, function(err, doc){
      if(err){
        res.send('There was an error');
      }
      else{
        var returnObject = {
          "original_url":doc.url,
          "short_url":doc.short_url
        }
        res.json(returnObject);
      }
    });
  }
  else res.send('(⊃｡•́‿•̀｡)⊃━☆ﾟ.*･｡ﾟ Invalid URL ( ✖ _ ✖ ) make sure to include the http://');

  // collection.find({},{},function(e, docs){
  //
  //   res.json(docs);
  //   console.log(shortid.generate());
  //
  // });
  //res.send('respond with a resource');
});
app.get('*', function(req, res, next) {
  var collection = db.get('urlcollection');
  var checkShortid = req.url.substr(1);
  collection.find({"shortid":checkShortid},{},function(e, docs){
    console.log(docs);
    // console.log(docs[0].shortid);
    // console.log(checkShortid);
    if(e){
      res.send('errord!');
    }
    else if (typeof docs[0] !=='object'||docs[0]== null) res.send('Invalid shortened url');
    else  res.redirect(301, docs[0].url)
    //else res.send('nope!')
    //console.log(shortid.generate());

  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

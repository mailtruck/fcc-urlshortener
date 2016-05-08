var express = require('express');
var router = express.Router();
var shortid = require('shortid');


/* GET users listing. */
router.get('*', function(req, res, next) {
  console.log(req.url);
  var db = req.db;
  var collection = db.get('urlcollection');
  collection.find({},{},function(e, docs){
    res.json(docs);
    console.log(shortid.generate());

  });
  //res.send('respond with a resource');
});

module.exports = router;

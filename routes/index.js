var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var config = require('config.js');


// set up the connection object we will need to use...
var connection = mysql.createConnection(config.db);

// now we can open the connection...
connection.connect((error)=>{
  if(error){
    console.log(error.stack);
    return;
  } else {
    console.log("connected as id " + connection.threadId);
  };
}); // connection.connected


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

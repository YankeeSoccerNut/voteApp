var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var config = require('../config');  // we added so we can reference config.db
var bcrypt = require('bcrypt-nodejs')


// set up the connection object we will need to use...
var connection = mysql.createConnection(config.db);

// now we can open the connection...
connection.connect((error)=>{
  if(error){
    throw error;
  } else {
    console.log("connected as id " + connection.threadId);
  };
}); // connection.connected


/* GET home page. */
router.get('/', secure_pass, function(req, res, next) {

  const getBands = new Promise((resolve, reject)=>{
    var selectQuery = `SELECT * FROM bands;`;
    connection.query(selectQuery,(error,results)=>{
      if (error){
        reject(error);
      } else {
        var rand = Math.floor(Math.random() * results.length);
        resolve(results[rand]);
      };
    });
  });

  getBands.then((bandObj)=>{
    console.log(bandObj);
    res.render('index', {
      name: req.session.name,
      band: bandObj
    });
  });

  getBands.catch((error)=>{
    res.json(error);
  });
}); // router.get /



router.get('/register', function(req, res, next) {
    res.render('register', {});
}); // router.get /register

router.get('/login', function(req, res, next) {
    res.render('login', {});
}); // router.get /login

router.get('/standings', secure_pass, function(req, res, next) {
    res.render('standings', {});
}); // router.get /standings

router.post('/registerProcess', function(req, res, next) {
    // console.log(req.body);
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    // check to see if user exists already...
    const selectQuery = "SELECT * FROM users WHERE email = ?;";
    connection.query(selectQuery, [email], (error, results)=>{
      if (results.length != 0) {  // user already exists
        res.redirect('/login?msg=registered')
      } else {  // new user...insert them
        // hash the password....
        var hash = bcrypt.hashSync(password);
        const insertQuery = `INSERT INTO users (name, email, password) VALUES (?,?,?);`;
        connection.query(insertQuery, [name,email, hash], (error)=>{
          if(error){
            throw error;
          } else {
            res.redirect('/?msg=registered');
          };
        });
      };
    }); // connection query
}); // router.get /register

router.post('/loginProcess', function(req, res, next) {
    // console.log(req.body);
    var email = req.body.email;
    var password = req.body.password;
    var selectQuery = `SELECT * FROM users where email = ?;`;
    connection.query(selectQuery, [email], (error, results)=>{
      if (error){
        throw error;
      } else {
        if (results.length == 0) // user doesn't exists
          res.redirect('/register?badUser');
        else {  // user exists...check password
          var passwordsMatch = bcrypt.compareSync(password, results[0].password);
          if (passwordsMatch) {
            console.log("Passwords MATCH");
            req.session.name = results[0].name;
            req.session.uid = results[0].id;
            req.session.email = results[0].email;
            req.session.loggedIn = true;
            res.redirect('/?msg=loginSuccess');
          } else {
            console.log("Password MISMATCH");
            res.redirect('/login?msg=badPass');
          };
        };
      };
    });
}); // router.post /loginProcess

router.get('/vote/:direction/:bandId', secure_pass, (req, res)=>{
  // res.json(req.params);
  var bandId = req.params.bandId;
  var direction = req.params.direction;

  var insertVoteQuery = `INSERT INTO votes (imageID, voteDirection, userID) VALUES (?, ?, ?);`;

  connection.query(insertVoteQuery, [bandId, direction, req.session.uid], (error, results)=>{
    if (error) {
      throw error;
    } else {
      res.redirect('/');
    };
  });
});  // router.get /vote/:direction/:bandId

// From stackoverflow response
function secure_pass(req, res, next) {
    if (req.session.loggedIn || req.path ==='/login') {
        next();
    } else {
       res.redirect("/login?msg=mustlogin");
    }
}

module.exports = router;

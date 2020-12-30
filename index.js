var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors')
const bcrypt = require('bcrypt');
// var Book = require('../models/Book.js');
var passHash = ""
// var book = require('./routes/book');
var app = express();
app.use(cors())
var BookSchema = new mongoose.Schema({
  isbn: String,
  title: String,
  author: String,
  description: String,
  published_year: String,
  publisher: String,
  updated_date: {
    type: Date,
    default: Date.now
  },
});

const Book = mongoose.model('Book', BookSchema);
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost/mean-angular5', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useMongoClient: true,
  promiseLibrary: require('bluebird')
})
  .then(() => console.log('Book connection successful'))
  .catch((err) => console.error(err));

var UserSchema = new mongoose.Schema({
  name: String,
  username: {
    type: String,
    unique: true
  },
  password: String,
  lastLogin: String,
  googleProfileInfo: String,
  facebookProfileInfo: String,
  updated_date: {
    type: Date,
    default: Date.now
  },
});

const User = mongoose.model('User', UserSchema);
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost/mean-angular5', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useMongoClient: true,
  promiseLibrary: require('bluebird')
})
  .then(() => console.log('User connection successful'))
  .catch((err) => console.error(err));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  'extended': 'false'
}));
app.use(express.static('public'));
// app.use('/books', express.static(path.join(__dirname, 'dist/mean-angular5')));
// app.use('/', BookSchema);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.send('error');
// });



/* GET ALL BOOKS */
app.get('/', function (req, res, next) {
  Book.find(function (err, products) {
    if (err) return next(err);
    console.log(products)
    res.json(products);
  });
});

/* GET SINGLE BOOK BY ID */
app.get('/:id', function (req, res, next) {
  Book.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* SAVE BOOK */
app.post('/', function (req, res, next) {
  Book.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* UPDATE BOOK */
app.put('/:id', function (req, res, next) {
  console.log(req.body)
  Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    upsert: true,
    useFindAndModify: false
  }, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE BOOK */
app.delete('/:id', function (req, res, next) {
  Book.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* SAVE User */
app.post('/register', function (req, res, next) {
  console.log('body Received: ')
  console.log(req.body)

  bcrypt.hash(req.body.password, 10, function (err, hash) {
    if (err) {
      console.log(err)
    } else {
      User.findOne({username: req.body.username}, function (err1, user) {
        if (err1) {
          console.log(err1)
          // res.json(err1)
        } else if (user) {
          res.send("userNameTaken")
        } else {
          User.create({...req.body,password: hash}, function (err2, post) {
            if (err2) {
              return next(err2);
            }
            console.log('saved:  ')
            console.log(post)
            res.json({name: post.name,
              username: post.username,
              lastLogin: post.lastLogin
            });
          })
        } 
      })
    }
  });
});

/* FIND User */
app.post('/login', function (req, res, next) {
  console.log('body Received: ')
  console.log(req.body)
  User.findOne({
    username: req.body.username
  }, function (err1, user) {
    if (err1) {
      console.log(err1)
      // res.json(err1)
    } else if (!user) {
      res.send("noUserFound")
    } else {
      if (req.body.password) {
        bcrypt.compare(req.body.password, user.password, function (err3, result) {
          if (err3) {
            res.json(err3)
          } else {
            console.log(result)
            if (result) {
              res.json({
                username: user.username,
                name: user.name
              })
            } else {
              res.send('wrongPassword')
            }
          }
        });
      }
    }
  })
});

module.exports = app;

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
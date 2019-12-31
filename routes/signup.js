var express = require('express');
const session = require('express-session')
var _ = require('lodash')
var { User } = require('../models/user');
var { authenticate } = require('../middleware/authenticate');
var router = express.Router();

// Home page route.
router.get('/', (req, res) => {
  if (req.session.xauth) {
    res.redirect('/shop')
  } else {
    res.render('signup.hbs')
  }
})

router.post('/', function (req, res) {

  var body = _.pick(req.body, ['name', 'email', 'password', 'acNum']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken()
  }).then((token) => {
    req.session.xauth = token
    res.redirect('/login');
  }).catch((e) => {
    res.render('signup.hbs', {message: 'error'})
  })

})

module.exports = router;
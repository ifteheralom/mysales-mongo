var express = require('express');
const session = require('express-session')
var SHA256 = require("crypto-js/sha256");
var _ = require('lodash')
var router = express.Router();

const products = require('../public/db/products')

var { User } = require('../models/user');
var { Todo } = require('../models/todo');
var { Account } = require('../models/bank');
var { Payment } = require('../models/payment');
var { Store } = require('../models/store');

var { authenticate } = require('../middleware/authenticate');
var { validateAuth } = require('../middleware/validateAuth');

router.get('/', (req, res) => {
    if(req.session.xauth) {
        User.findByToken(req.session.xauth).then((user) => {
            // console.log(user);
            res.render('profile.hbs', { user })
        }).catch((e) => {
            console.log(e);
            res.status(400).send(e);
        })
    } else {
        res.redirect('/login')
    }

    // Payment.find({
    //     acFrom: 112233
    // }).then((result) => {
    //     res.render('purchases.hbs', {item: result})
    // }, (e) => {
    //     res.status(400).send(e);
    // });

    // res.render('profile.hbs')
});

router.post('/', function (req, res) {
    // console.log(req.body)
    User.findByToken(req.session.xauth).then((user) => {
        User.findOneAndUpdate({ _id: user._id }, { $set: req.body }, { new: true }).then((update) => {
            if (!update) {
                return res.status(404).send();
            }
            res.status(200).redirect('/profile')
        }).catch((e) => {
            console.log(e);
        })
    }).catch((e) => {
        console.log(e);
    })

})

module.exports = router;
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
    User.findByToken(req.session.xauth).then((user) => {
        // console.log(user.acNum)
        Payment.find({
            acFrom: user.acNum
        }).then((result) => {
            res.render('purchases.hbs', {item: result})
        }, (e) => {
            res.status(400).send(e);
        });
    }).catch((e) => {
        console.log(e);        
    })
    
    // Payment.find({
    //     acFrom: 112233
    // }).then((result) => {
    //     res.render('purchases.hbs', {item: result})
    // }, (e) => {
    //     res.status(400).send(e);
    // });
});

module.exports = router;
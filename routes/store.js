var express = require('express');
const session = require('express-session')
var _ = require('lodash')
var router = express.Router();

const products = require('../public/db/products')

var { User } = require('../models/user');
var { Todo } = require('../models/todo');
var { Account } = require('../models/bank');
var { Store } = require('../models/store');

var { authenticate } = require('../middleware/authenticate');
var { validateAuth } = require('../middleware/validateAuth');

router.get('/:pId', (req, res) => {
    Store.find({
        pId: req.params.pId
    }).then((result) => {
        res.send(result);
    }, (e) => {
        res.status(400).send(e);
    });
});


router.get('/:pId/:pQty', (req, res) => {
    Store.find({
        pId: req.params.pId
    }).then((result) => {        
        if (result[0].pQty > req.params.pQty) {
            return Store.findOneAndUpdate(
                { pId: req.params.pId },
                { pQty: (result[0].pQty - req.params.pQty) },
                { new: true })
        } else {
            new Promise.reject()
        }
    }).then((result) => {
        if(!result) new Promise.reject()
        res.send(result);
    })
    .catch((e) => {
        res.status(400).send();
    })
});

module.exports = router;
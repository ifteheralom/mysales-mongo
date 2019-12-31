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

router.get('/:acNum', (req, res) => {
    Account.find({
        acNum: req.params.acNum
    }).then((result) => {
        res.send(result);
    }, (e) => {
        res.status(400).send(e);
    });
});


router.get('/:acFrom/:acTo/:acPin/:amt', (req, res) => {

    if (req.params.acPin === null) res.status(200).send({ message: 'failed' });
    Account.find({
        acNum: req.params.acFrom,
        acPin: SHA256(req.params.acPin).toString()
    }).then((result) => {
        // console.log(result);

        if (result[0].acBal > req.params.amt) {
            return Account.findOneAndUpdate(
                { acNum: req.params.acFrom },
                { acBal: (parseInt(result[0].acBal) - parseInt(req.params.amt)) },
                { new: true })
        } else {
            new Promise.reject()
        }
    }).then((result) => {
        if (!result) new Promise.reject()
        return Account.find({
            acNum: req.params.acTo
        })
    }).then((result) => {
        return Account.findOneAndUpdate(
            { acNum: req.params.acTo },
            { acBal: (parseInt(result[0].acBal) + parseInt(req.params.amt)) },
            { new: true })

    }).then(() => {

        return User.findByToken(req.session.xauth).then((user) => {
            return Todo.find({
                _creator: user._id
            }).then((items) => {
                let todos = ''
                items.forEach((item) => {
                    let temp = item.pId + ':' + item.pQty + ':' + item.pPrice
                    console.log('temp: ', temp)
                    todos += temp + ', '
                })

                console.log(todos)

                let payment = new Payment({
                    acFrom: req.params.acFrom,
                    acTo: req.params.acTo,
                    amt: req.params.amt,
                    payId: Date.now(),
                    date: new Date(),
                    list: todos
                })
                return payment.save()
            });
        })

    }).then((result) => {
        if (!result) new Promise.reject()
        res.status(200).send({ message: 'success' })
    })
        .catch((e) => {
            console.log(e)
            res.status(200).send({ message: 'failed', error: e });
        })
})

module.exports = router;
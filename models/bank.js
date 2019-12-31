var mongoose = require('mongoose');

var Account = mongoose.model('Account', {
    acName: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    acPin: {
        type: String,
        default: false
    },
    acNum: {
        type: Number,
        default: null
    },
    acBal: {
        type: Number,
        default: null
    },
});

module.exports = { Account };
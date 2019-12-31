var mongoose = require('mongoose');

var Payment = mongoose.model('Payment', {
    date: {
        type: String,
        default: null
    },
    payId: {
        type: String,
        default: null
    },
    acFrom: {
        type: Number,
        required: true,
        minlength: 1,
        trim: true
    },
    acTo: {
        type: Number,
        default: null
    },
    amt: {
        type: Number,
        default: null
    },
    list: {
        type: String
    }
});

module.exports = { Payment };
var mongoose = require('mongoose');

var Store = mongoose.model('Store', {
    pId: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    pName: {
        type: String,
        default: false
    },
    pQty: {
        type: Number,
        default: null
    },
    pPrice: {
        type: Number,
        default: null
    },
});

module.exports = { Store };
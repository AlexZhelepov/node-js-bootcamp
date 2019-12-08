const mongoose = require('mongoose')

const docSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    handled: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const Doc = mongoose.model('Doc', docSchema)
module.exports = Doc
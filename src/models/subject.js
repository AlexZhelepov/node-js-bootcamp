const mongoose = require('mongoose')

const subjectSchema = new mongoose.Schema({
    class: {
        type: String,
        trim: true,
        required: true,
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
}, {
    timestamps: true
})

const Subject = mongoose.model('Subject', subjectSchema)
module.exports = Subject
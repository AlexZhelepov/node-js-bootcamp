const mongoose = require('mongoose')

const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    foreword: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

const Skill = mongoose.model('Skill', skillSchema)
module.exports = Skill
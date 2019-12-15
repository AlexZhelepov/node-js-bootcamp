const mongoose = require('mongoose')

const userInfoSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    rank: {
        type: String,
        default: 'работник' // потом поменять!
    },
    skills: [{
        name: { 
            type: String,
            required: true
        },
        value: {
            type: Number,
            default: 0
        }
    }],
    subjects: [{
        name: {
            type: String,
            required: true
        },
        value: {
            type: Number,
            default: 0
        }
    }]
}, {
    timestamps: true
})

const UserInfo = mongoose.model('UserInfo', userInfoSchema)
module.exports = UserInfo
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
    vacation: {
        type: Number,
        default: 0.0
    },
    experienceYears: {
        type: Number,
        default: 0
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
    }],
    stats: [{
        docId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Doc'
        },
        class: [{
            name: {
                type: String,
                required: true
            }
        }],
        word: {
            type: String,
            required: true
        },
        count: {
            type: Number,
            default: 0
        }
    }],
    statsStr: {
        type: String
    }
}, {
    timestamps: true
})

const UserInfo = mongoose.model('UserInfo', userInfoSchema)
module.exports = UserInfo
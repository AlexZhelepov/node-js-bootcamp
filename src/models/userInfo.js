const mongoose = require('mongoose')

const userInfoSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    skills: [{
        name: { 
            type: String,
            required: true
        }
    }],
    subjects: [{
        name: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

const UserInfo = mongoose.model('UserInfo', userInfoSchema)
module.exports = UserInfo
const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    vacancies: [{
        name: {
            type: String,
            required: true
        },
        qualification: {
            type: Number,
            default: 25,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UserInfo'
        }
    }]
}, {
    timestamps: true
})

const Project = mongoose.model('Project', projectSchema)
module.exports = Project
const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/task')
require('../db/mongoose')

// POST task data to save it.
router.post('/tasks', auth, async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            user: req.user._id
        })
        await task.save()
        res.status(201).send(task)
    }
    catch (e) {
        res.status(400).send(e)
    }
})

// Get a list of tasks.
// GET /tasks?completed=true
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt:asc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const options = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.limit) {
        options.limit = parseInt(req.query.limit)
    }

    if (req.query.skip) {
        options.skip = parseInt(req.query.skip)
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'asc' ? 1 : -1
        options.sort = sort
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options
        }).execPopulate()
        res.send(req.user.tasks)
    }
    catch (e) {
        send.status(400).send(e)
    }
})

// Retrieves a task by id.
router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const _id = req.params.id
        const task = await Task.findOne({ _id, user: req.user._id })

        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    }
    catch (e) {
        res.status(400).send(e)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const update = ['description', 'completed']
    const sendToUpdate = Object.keys(req.body)
    const isValidToUpdate = sendToUpdate.every((value) => {
        return update.includes(value)
    })

    if (!isValidToUpdate) {
        return res.status(400).send({ error: 'Invalid set of fields!' })
    }
    
    try {
        const _id = req.params.id
        const task = await Task.findOne({_id, user: req.user._id})
        if (!task) {
            return res.status(404).send()
        }
        
        update.forEach((uf) => task[uf] = req.body[uf])
        await task.save()        
        res.send(task)
    }
    catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async(req, res) => {
    try {
        const _id = req.params.id
        const task = await Task.findOneAndDelete({_id, user: req.user._id})

        if (!task) {
            res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router
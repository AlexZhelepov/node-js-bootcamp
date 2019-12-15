const express = require('express')
const router = new express.Router()
const Project = require('../models/project')
require('../db/mongoose')

router.get('/projects/list', async (req, res) => {
    try {
        const projects = await Project.find({})

        res.render('project_list', {
            projects
        })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/projects/add', async (req, res) => {
    try {
        const project = new Project(req.body)
        await project.save()
        res.status(201).send()
    }
    catch (e) {
        res.status(400).send(e)
    }
})

router.post('/projects/update', async (req, res) => {
    try {
        const project = await Project.findById(req.body.id)

        project.name = req.body.name
        project.description = req.body.description
        project.vacancies = req.body.vacancies

        await project.save()

        res.send()
    }
    catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router
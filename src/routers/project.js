const express = require('express')
const router = new express.Router()
const Project = require('../models/project')
const UserInfo = require('../models/userInfo')
const genetic = require('../utils/genetic_algorithm')
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

        console.log(req.body)

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

router.get('/projects/details/:id', async (req, res) => {
    try {
        const _id = req.params.id
        const project = await Project.findOne({ _id })

        if (!project) {
            return res.status(404).send()
        }

        // Решается через populate(), но нужно смотреть как.
        let users = []
        for (let i = 0; i < project.vacancies.length; i++) {
            if (project.vacancies[i].user) {
                const user = await UserInfo.findOne(project.vacancies[i].user)
                users.push(user)
            }
        }

        res.render('project_details', {
            project, users
        })
    }
    catch (e) {
        res.status(400).send(e)
    }
})

// Формирует команду проекта.
router.post('/projects/form/:id', async (req, res) => {
    try {
        const _id = req.params.id

        const employees = await UserInfo.find({})
        const project = await Project.findById(_id)
        const settings = req.body

        const team = genetic.geneticAlgorithm(project, employees, settings.teamCount, settings.mutCount, settings.eliteCount, settings.epochCount, settings.teamMut)
        
        // Заполняем вакансии проекта исполнителями.
        let users = []
        for (let i = 0; i < project.vacancies.length; i++) {
            project.vacancies[i].user = team[i]._id
            const user = await UserInfo.findOne(team[i]._id)
            users.push(user)
        }

        await project.save()

        res.render('project_details', {
            project, users
        })
    }
    catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router
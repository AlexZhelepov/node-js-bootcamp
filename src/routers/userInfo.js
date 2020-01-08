const express = require('express')
const router = new express.Router()
const UserInfo = require('../models/userInfo')
require('../db/mongoose')

router.get('/userInfo/list', async (req, res) => {
    try {
        const userInfos = await UserInfo.find({})
        res.render('userInfo_list', { userInfos })
    }
    catch (e) {
        res.status(400).send({ msg: error })
    }
})

router.post('/userInfo/list', async (req, res) => {
    try {
        // Обновляем значения пользователей.
        for (let i = 0; i < req.body.length; i++) {
            let userInfo = await UserInfo.findById(req.body[i].id)
            userInfo.skills = req.body[i].skills
            userInfo.subjects = req.body[i].subjects
            userInfo.experienceYears = req.body[i].experienceYears
            userInfo.vacation = req.body[i].vacation
            await userInfo.save()
        }
        res.send()
    }
    catch (e) {
        res.status(400).send()
    }
})

module.exports = router
const express = require('express')
const router = new express.Router()
const UserInfo = require('../models/userInfo')
require('../db/mongoose')

router.get('/userInfo/list', async (req, res) => {
    try {
        const userInfos = await UserInfo.find({})
        let strStats = []

        for (let i = 0; i < userInfos.length; i++) {
            const st = setStats(userInfos[i].stats)
            strStats.push({name: userInfos[i].name, stats: st})
        }

        res.render('userInfo_list', { userInfos, strStats })
    }
    catch (e) {
        console.log(e)
        res.status(400).send({ msg: e })
    }
})

// Сделано костылем, т.к. извольте в 02:00 ночи башка не работает совсем. И это факт.
const setStats = (stats) => {
    let res = []

    // 1. Конвертируем в однострочный массив.
    for (let i = 0; i < stats.length; i++) {
        for (let j = 0; j < stats[i].class.length; j++) {
            const key = stats[i].class[j].name
            const count = stats[i].count

            if (key in res) {
                res[key] += count
            } else {
                res.push({
                    key: key, value: count
                })
            }
        }
    }

    let res2 = []
    let checked = []
    let sum = 0

    // 2. Расчет классификации.
    for (let i = 0; i < res.length; i++) {
        const cls = res[i].key
        let val = 0

        if (checked.includes(cls)) {
            continue
        }

        for (let j = 0; j < res.length; j++) {
            if (res[j].key === cls) {
                val += res[j].value
                sum += res[j].value
            }
        }

        checked.push(cls)
        res2.push({subject: cls, percent: val})
    }

    // 3. Считаем проценты.
    res2 = res2.map((v) => { return { subject: v.subject, count: v.percent / sum * 100}})

    // 4. Преобразуем в html-строку.
    const st = (res2.map((v) => { return v.subject + ': ' + v.count })).join('\n')

    return st
}

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
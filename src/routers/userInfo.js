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

        const allUserStats = 
            userInfos
                .map((v) => { return { name: v.name, stats: v.stats } })
                .filter((v) => { return v.stats.length > 0 })

        const groupedStats = groupByClassName(allUserStats)

        res.render('userInfo_list', { userInfos, strStats, groupedStats })
    }
    catch (e) {
        console.log(e)
        res.status(400).send({ msg: e })
    }
})

const groupByClassName = (data) => {
    let arr = []
    
    // 1. Определяем все классы и количество слов в них для каждого из пользователей.
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].stats.length; j++) {
            for (let c = 0; c < data[i].stats[j].class.length; c++) {
                const cls = data[i].stats[j].class[c]

                arr.push({
                    count: data[i].stats[j].count,
                    className: cls.name,
                    user: data[i].name,
                })
            }
        }
    }

    // 2 Общее количество слов для user.
    let checkedUsers = []
    let total = []
    for (let i = 0; i < arr.length; i++) {
        const user = arr[i].user
        const count = arr[i].count

        if (!checkedUsers.includes(user)) {
            total[user] = count
            checkedUsers.push(user)
        } else {
            total[user] += count
        }
    }

    // 3. Класс-имя-количество.
    let checkedPairs = []
    let res = []

    for (let i = 0; i < arr.length; i++) {
        const cls = arr[i].className
        const name = arr[i].user
        const count = arr[i].count
        
        // Через хитрый костыль.
        // Если еще не проверили пару класс - имя.
        if (!checkedPairs.includes(cls + name)) {
            res[cls + '|' +  name] = count
            checkedPairs.push(cls + name)
        } 
        // уже находили ее.
        else {
            res[cls + '|' + name] += count
        }
    }

    // 4. Итоговая группировка по классам.
    let grouped = []

    Object.keys(res).forEach(function(key) {
        var value = res[key];
        const splitted = key.split('|')

        const cls = splitted[0]
        const user = splitted[1]

        grouped.push({
            class: cls,
            user: user,
            percent: (res[key] / total[user] * 100).toFixed(2)
        })
    });

    let passedClasses = []
    let preFinal = []

    for (let i = 0; i < grouped.length; i++) {
        const cls = grouped[i].class
        const user = grouped[i].user
        const percent = grouped[i].percent

        if (!passedClasses.includes(cls)) {
            preFinal[cls] = (user + ' (' + percent + ') ')
            passedClasses.push(cls)
        } else {
            preFinal[cls] += (user + ' (' + percent + ') ')
        }
    }

    final = []
    Object.keys(preFinal).forEach(function(key) {
        var value = preFinal[key];

        final.push({
            class: key,
            value: value
        })
    });

    return final
}

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
    res2 = res2.map((v) => { return { subject: v.subject, count: (v.percent / sum * 100).toFixed(2)}})

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
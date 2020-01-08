const express = require('express')
const router = new express.Router()
const Subject = require('../models/subject')
require('../db/mongoose')

// Получение данных о текущей онтологии.
router.get('/ontology', async(req, res) => {
    try {
        // Предметные области.
        const subjects = await Subject.find({})

        // Извлекаем все классы.
        let classes = []
        for (let i = 0; i < subjects.length; i++) { 
            if (!classes.includes(subjects[i].class)) {
                classes.push(subjects[i].class)
            }
        }

        // Группировка данных по классам.
        const displayData = []
        for (let i = 0; i < classes.length; i++) {
            const c = classes[i]
            const terms = subjects.filter((i) => {
                return i.class === c
            })
            const names = terms.map((i) => {
                return i['name']
            })
            const row = names.join(',')

            displayData.push({
                class: c, row
            })
        }

        res.render('ontology', {
            displayData            
        })
    }
    catch(e) {
        res.status(400).send(e)
    }
})

router.post('/ontology', async (req, res) => {
    try {
        const data = req.body
        const subjects = await Subject.find({})

        // Обработка входных данных.
        let convertedData = []
        for (let i = 0; i < data.length; i++) {
            const terms = data[i].terms.split(',')
            const cls = data[i].class

            for (let j = 0; j < terms.length; j++) {
                convertedData.push({
                    class: cls,
                    term: terms[j]
                })    
            }
        }
        
        // Сохранение данных.
        // Так лучше никогда не делать =)
        await Subject.deleteMany({})

        // И просто переписываем =)
        for (let i = 0; i < convertedData.length; i++) {
            const sbj = new Subject({
                class: convertedData[i].class,
                name: convertedData[i].term
            })

            await sbj.save()
        }

        res.send()
    }   
    catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router
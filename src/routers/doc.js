const express = require('express')
const Doc = require('../models/doc')
const formidable = require('formidable')
const fs = require('fs')
const mammoth = require('mammoth')
const child_process = require('child_process')
const line_reader = require('line-reader')
const router = new express.Router()
const Skill = require('../models/skill')
const Subject = require('../models/subject')
const UserInfo = require('../models/userInfo')
require('../db/mongoose')

const multer = require('multer')

// ACTION. Получить список документов.
router.get('/doc/list', async (req, res) => {
    const docs = await Doc.find({})
    res.render('docs_list', {
        documents: docs
    })
})

// ACTION. Обработать документ и сохранить информацию о нем.
router.get('/handle/:id', async (req, res) => {
    const _id = req.params.id
    try {
        const doc = await Doc.findById({_id})
        const skills = await Skill.find({})
        const subjects = await Subject.find({})

        // Подготовка html-формы.
        let html_view = undefined
        let raw_view = undefined

        // Извлечение html.
        await mammoth.convertToHtml({path: doc.path})
            .then((r) => {
                html_view = r.value
            })
            .catch((err) => {
                res.render('word_viewer', {
                    error: 'Не получилось преобразовать документ в html-код'
                })    
            })
        
        // Извлечение просто текста.
        await mammoth.extractRawText({path: doc.path})
            .then((r) => {
                raw_view = r.value
            })
            .catch((err) => {
                res.render('word_viewer', {
                    error: 'Не получилось преобразовать документ в html-код'
                })    
            })

        // MYSTEM.
        // Сохранение файла с текстом для его использования.
        fs.writeFile(process.env.MYSTEM_FOLDER + 'input.txt', raw_view, () => {
            const cmd = 'cd '+ process.env.MYSTEM_FOLDER + ' &&  mystem.exe input.txt output.txt'
            child_process.exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    res.render('word_viewer', {
                        error: 'Произошла неизвестная ошибка: ' + error.message
                    })
                }

                // Выделение слов текста.
                fs.readFile(process.env.MYSTEM_FOLDER + 'output.txt', 'utf-8', (err, data) => {
                    const normal_words = [...data.matchAll(/(?<=\{)(.*?)(?=\})/g)]
                    let raw_words = [...data.match(/^.*?(?={)/)]
                    raw_words = raw_words.concat([...data.matchAll(/((?<=\})(.*?)(?=\{))/g)])

                    let words = []
                    
                    // Слова берутся парами: как в тексте - нормализованное.
                    normal_words.forEach((v, i) => {
                        if (v[0].includes('|')) {
                            let sub_arr = v[0].split('|')
                            sub_arr.forEach((v_s) => words.push({
                                raw: raw_words[i][0],
                                norm: v_s
                            }))
                        }
                        else {
                            words.push({
                                raw: raw_words[i][0],
                                norm: v[0]
                            })
                        }
                    })

                    // Удаление лишних символов из обнаруженных слов.
                    words.forEach((v) => {
                        if (v.raw.includes('?')) {
                            v.raw = v.raw.replace('?', '')
                        }

                        if (v.norm.includes('?')) {
                            v.norm = v.norm.replace('?', '')
                        }
                    })

                    // Подготовка словаря со словами.
                    dict = orderWords(words)

                    // Генерация редактора.
                    res.render('word_viewer', {
                        doc: doc,
                        doc_html: html_view,
                        doc_raw: raw_view,
                        words: JSON.stringify(dict),
                        skills: JSON.stringify(skills),
                        subjects: JSON.stringify(subjects),
                        orderedWords: JSON.stringify(words)
                    })    
                })
            })
        })
    }
    catch(e) {
        res.render('word_viewer', {
            error: 'Произошла неизвестная ошибка: ' + e.message
        })
    }
})

// Создает словарь из слов.
// Ключ: слово в нормальной форме, значения: все встречаюшиеся слова в тексте.
const orderWords = (words) => {
    let res = {}
    
    for (let i = 0; i < words.length; i++) {
        const n = words[i].norm
        const r = words[i].raw

        if (n in res) {
            res[n].push(r)
        } else {
            res[n] = [r]
        }
    }

    return res
}

// ACTION. Обучение с помощью документа.
// Читаем файл и готовим весь необходимый контент через mystem.
router.get('/learn/:id', async (req, res) => {
    try {
        const _id = req.params.id
        let raw_view = undefined
        const doc = await Doc.findById({_id})

        // Извлечение просто текста.
        await mammoth.extractRawText({path: doc.path})
            .then((r) => {
                raw_view = r.value
            })
            .catch((err) => {
                throw new Error('Не удалось найти файл!')
            })

        fs.writeFile(process.env.MYSTEM_FOLDER + 'input.txt', raw_view, async () => { 
            const cmd = 'cd '+ process.env.MYSTEM_FOLDER + ' &&  mystem.exe -cgin --format json input.txt output.txt'
            
            child_process.exec(cmd, async (error, stdout, stderr) => {
                if (error) {
                    throw new Error('Произошла ошибка при обработке файла!')
                }

                let terms = []
                const classes = ['']
                const subjects = await Subject.find({})

                for (let i = 0; i < subjects.length; i++) {
                    const cls = subjects[i].class
                    if (!classes.includes(cls)) {
                        classes.push(cls)
                    }
                }

                line_reader.eachLine(process.env.MYSTEM_FOLDER + 'output.txt', async (line, last) => {
                    const json = JSON.parse(line)
                    
                    if (json.analysis) {
                        for (let i = 0; i < json.analysis.length; i++) {
                            if (json.analysis[i].gr[0] === 'S') {
                                terms.push({term: json.analysis[i].lex, classes})
                            }    
                        }
                    }

                    if(last){
                        // Все прошло успешно!
                        res.render('learn', {
                            terms
                        })
                    }
                });
            })
        })
    }
    catch (e) {
        console.log('Error')
        res.status(400).send()
    }
})

// Сохранение данных о терминах новых.
router.post('/learn', async (req, res) => {
    try {
        let data = req.body.filter((v, i, arr) => {
            if (v.className !== '') {
                return v
            }
        })

        const subjects = await Subject.find({})
        let items = []

        for (let j = 0; j < data.length; j++) {
            if (!checkIfExists(data[j], subjects)) {
                items.push(data[j])
            }
        }

        // Сохранение новых терминов.
        for (let i = 0; i < items.length; i++) {
            let obj = {}
            obj.class = items[i].className
            obj.name = items[i].term

            let sbj = new Subject(obj)
            await sbj.save()
        }
        res.send()
    }
    catch (e) {
        res.status(400).send()
    }
})

const checkIfExists = (val, subjects) => {
    for (let i = 0; i < subjects.length; i++) {
        if (subjects[i].class === val.className && subjects[i].name === val.term) {
            return true
        }
    }
    return false
}

// ACTION. Обработка документа с сохранением всех результатов.
router.post('/handle/:id', async (req, res) => {
    try {
        // Предоставление информации о том, что пользователь может быть задвоен.
        if (req.body.firstPhase === true) {
            const employees = req.body.data.employees
            let doubledUsers = []
            let newUsers = []

            for (let i = 0; i < employees.length; i++) {
                const userInfo = await UserInfo.findOne({name: employees[i]})
                if (userInfo) {
                    doubledUsers.push(employees[i])
                } else {
                    newUsers.push(employees[i])
                }
            }
            res.send({ doubledUsers, newUsers })
        } 
        // Сохранение.
        else if (req.body.secondPhase === true) {
            const toAdd = req.body.toAdd
            const toUpdate = req.body.toUpdate

            // Сохраняем.
            for (let i = 0; i < toAdd.length; i++) {
                const userInfo = new UserInfo(toAdd[i])
                await userInfo.save()
            }

            // Обновляем?.
            for (let i = 0; i < toUpdate.length; i++) {
                if (toUpdate[i].checked === true) {
                    // Находим исполнителя.
                    const userInfo = await UserInfo.findOne({ name: toUpdate[i].name })
                    
                    let skillsToAdd = []
                    let subjectsToAdd = []

                    // Обновляем его компетенции.
                    // Текущие компетенции.
                    for (let j = 0; j < toUpdate[i].skills.length; j++) {
                        let hasSkill = false
                        const skillToCheck = toUpdate[i].skills[j]

                        for (let n = 0; n < userInfo.skills.length; n++) {
                            if (skillToCheck.name === userInfo.skills[n].name) {
                                hasSkill = true
                                break                                
                            }
                        }

                        if (hasSkill === false) {
                            skillsToAdd.push(skillToCheck)
                        }
                    }

                    // Обновляем его предметные области.
                    // Текущие предметные области.
                    for (let j = 0; j < toUpdate[i].subjects.length; j++) {
                        let hasSubject = false
                        const subjectToCheck = toUpdate[i].subjects[j]

                        for (let n = 0; n < userInfo.subjects.length; n++) {
                            if (subjectToCheck.name === userInfo.subjects[n].name) {
                                hasSubject = true
                                break                                
                            }
                        }

                        if (hasSubject === false) {
                            subjectsToAdd.push(subjectToCheck)
                        }
                    }

                    // update skills.
                    skillsToAdd.forEach((v) => {
                        userInfo.skills.push(v)
                    })

                    // update subjects.
                    subjectsToAdd.forEach((v) => {
                        userInfo.subjects.push(v)
                    })

                    await userInfo.save()
                }
            }
            res.send()
        }
    }
    catch (e) {
        res.status(400).send(e)
    }
})

// ACTION. Открыть страницу о документе.
router.get('/doc/load', async(req, res) => {
    res.render('load_docx')    
})

// ACTION. Сохранить информацию о документе.
router.post('/doc/load', (req, res) => {
    let form = new formidable.IncomingForm()
    form.parse(req)

    // Сохраняет файл в директорию ./files проекта.
    form.on('fileBegin', (name, file) => {
        const path = process.env.FILE_PATH + file.name
        try {
            file.path = path
        } catch(e) {
            if (fs.existsSync(path)) {
                fs.unlinkSync(path)
            }
            res.status(400).send()
        }
    })

    // Создание записи о файле в БД.
    form.on('file', (name, file) => {
        try {
            if (!fs.existsSync(file.path)) {
                throw new Error('При сохранении файла была обнаружена ошибка!')
            }
            Doc.create({
                name: file.name,
                path: file.path,
            })
            res.send()
        }
        catch(e) {
            fs.unlinkSync(file.path)
            res.status(400).send()
        }
    })    

    form.on('error', (err) => {
        res.status(400).send({error: err.message})
    })
})

module.exports = router
const express = require('express')
const Doc = require('../models/doc')
const formidable = require('formidable')
const fs = require('fs')
const mammoth = require('mammoth')
const child_process = require('child_process')
const router = new express.Router()
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
                    data = data.toLowerCase()

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

                    // Генерация редактора.
                    res.render('word_viewer', {
                        doc: doc,
                        doc_html: html_view,
                        doc_raw: raw_view,
                        words: JSON.stringify(words)
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

// ACTION. Обработка документа с сохранением всех результатов.
router.post('/handle/:id', async(req, res) => {

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
// https://docs.google.com/document/d/19pAS2NQx_E7GhEIAs07RvsMdr3o-0EdlKo2LyoWHXmA/edit (К)
// https://docs.google.com/document/d/1Xa3kUBdSKaHhaNi3r7ov5V2i1PV1BumUpjTUKK2TCxU/edit (М)

// https://github.com/noobcoder1137/Todo_Rest_CRUD_Application_JQuery_FetchAPI (example)
// https://habr.com/ru/post/273581/ (handlebars - руководство)

const express = require('express')
const path = require('path')
const hbs = require('hbs')
const expressHbs = require('express-handlebars')
require('./db/mongoose') // connects to DB.
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const docRouter = require('./routers/doc')
const userInfoRouter = require('./routers/userInfo')
const projectRouter = require('./routers/project')
const ontologyRouter = require('./routers/ontology')
const auth = require('./middleware/auth')
const Subject = require('./models/subject')
const Skill = require('./models/skill')

const app = express()
const port = process.env.PORT

// Paths for express config.
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/')
const partialsPath = path.join(__dirname, '../templates/partials')

// Setup layout.
app.engine('hbs', expressHbs({
    layoutsDir: 'templates/layouts',
    defaultLayout: 'layout',
    extname: 'hbs'
}))

// Setup handlebars and views location.
app.set('view engine', 'hbs') // Dynamic web pages.
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// Setup static directory to use.
app.use(express.static(publicDirectoryPath)) // Static web pages.

// Makes all json accessible in handlers.
app.use(express.json())
app.use(docRouter)
app.use(userRouter)
app.use(taskRouter)
app.use(projectRouter)
app.use(userInfoRouter)
app.use(ontologyRouter)

app.get('/', async (req, res) => {
    res.render('index')
})

const initSkillsAndSubjects = async () => {
    const subjects = await Subject.find({})
    const skills = await Skill.find({})

    const initSkills = [
        new Skill({ name: 'составление', foreword: 1}), 
        new Skill({ name: 'план-график', foreword: -1}), 
        new Skill({ name: 'отчетность', foreword: -1}), 
        new Skill({ name: 'план', foreword: -1}), 
        new Skill({ name: 'мероприятие', foreword: -1}), 
        new Skill({ name: 'финансирование', foreword: 1}), 
        new Skill({ name: 'заключение', foreword: 1}), 
        new Skill({ name: 'соглашение', foreword: -1}), 
        new Skill({ name: 'составление', foreword: 1}), 
        new Skill({ name: 'рекомендация', foreword: -1}), 
        new Skill({ name: 'рекомендации', foreword: -1}), 
        new Skill({ name: 'создание', foreword: 1}), 
        new Skill({ name: 'утверждение', foreword: 1}), 
        new Skill({ name: 'проведение', foreword: 1}), 
    ]

    const initSubjects = [
        new Subject ({ class: 'здравоохранение', name: 'здравоохранение' }),
        new Subject ({ class: 'демография', name: 'демография' }), 
        new Subject ({ class: 'инновации', name: 'инновации' }), 
        new Subject ({ class: 'среда', name: 'среда' }),
        new Subject ({ class: 'IT', name: 'ит' }), 
        new Subject ({ class: 'IT', name: 'it' }),
        new Subject ({ class: 'агропромышленность', name: 'агропромышленность'}),
        new Subject ({ class: 'экспорт', name: 'экспорт' }),
        new Subject ({ class: 'семья', name: 'семья' }),
        new Subject ({ class: 'образование', name: 'образование' }),
        new Subject ({ class: 'кадры', name: 'кадры' }),
        new Subject ({ class: 'бюджетирование', name: 'бюджетирование' }),
        new Subject ({ class: 'экология', name: 'экология' }),
        new Subject ({ class: 'строительство', name: 'строительство' }),
        new Subject ({ class: 'культура', name: 'культура' })
    ]

    if (subjects.length === 0) {
        await Subject.insertMany(initSubjects)
    }

    if (skills.length === 0) {
        await Skill.insertMany(initSkills)
    }
}

// Starts server...
app.listen(port, async () => {
    await initSkillsAndSubjects()
    console.log('Successfully started server on port ' + port)
})
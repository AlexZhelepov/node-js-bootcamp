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
const auth = require('./middleware/auth')

const app = express()
const port = process.env.PORT

console.log(path.join(__dirname, '../public'))

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

app.get('/', async (req, res) => {
    res.render('index')
})

// Starts server...
app.listen(port, () => {
    console.log('Successfully started server on port ' + port)
})
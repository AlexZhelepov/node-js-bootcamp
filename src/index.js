const express = require('express')
require('./db/mongoose') // connects to DB.
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

// Makes all json accessible in handlers.
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

// Starts server...
app.listen(port, () => {
    console.log('Successfully started server on port ' + port)
})
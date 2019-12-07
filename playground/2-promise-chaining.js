require('../src/db/mongoose')
const Task = require('../src/models/task')

/*Task.findByIdAndDelete('5de20d3fdffe502b24242efb')
    .then((r) => {
        console.log('deleted')
        console.log(r)
        return Task.find({completed: false})
    })
    .then((r) => {
        console.log(r.length)
    })
    .catch((e) => {
        console.log('Error caught: ' + e)
    })*/

// ObjectId("5de21a5f1861fb3760e8ca55")

const deleteTaskAndCount = async (id, status) => {
    await Task.findByIdAndDelete(id)
    const count = await Task.countDocuments({ completed: status })
    return count
}

deleteTaskAndCount('5de21a5f1861fb3760e8ca55', false).then((res) => {
    console.log(res)
}).catch((e) => { 
    console.log(e) 
})
require('../src/db/mongoose')
const User = require('../src/models/user')

//ObjectId("5de2289641a00726183f1cdc")
const _id = '5de2289641a00726183f1cdc'

/*User.findByIdAndUpdate(_id, {age: 25}).then((user) => {
    return User.countDocuments({age:0})
}).then((res) => {
    console.log(res)
}).catch((e) => {
    console.log(e)
})*/

const updateAgeAndCount = async (id, age) => {
    const user = await User.findByIdAndUpdate(id, { age })
    const count = await User.countDocuments({ age })
    return count
}

updateAgeAndCount('5de212abd53f0921dc4f08ad', 158).then((count) => {
    console.log(count)
}).catch((e) => {
    console.log(e)
})
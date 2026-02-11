const mongoose = require('mongoose')

// if (process.argv.length < 3) {
//   console.log('give password as argument')
//   process.exit(1)
// }

if (process.argv.length < 5) {
  console.log('not enough arguments to create a new item')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://tounivee_db_user:${password}@cluster0.jar9pon.mongodb.net/?appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url, { family: 4 })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name: name,
  number: number,
})

person.save().then(() => {
  console.log(`added ${name} number ${number} to phonebook`)
  mongoose.connection.close()
})

// Person.find({}).then((result) => {
//   result.forEach((person) => {
//     console.log(person)
//   })
//   mongoose.connection.close()
// })
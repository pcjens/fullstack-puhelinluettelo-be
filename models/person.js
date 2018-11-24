require('dotenv').config()
const mongoose = require('mongoose')

mongoose.connect('mongodb://' +
                 process.env.DB_USER + ':' +
                 process.env.DB_PASS + '@' +
                 process.env.DB_CONN, { useNewUrlParser: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  id: Number
})

personSchema.statics.format = (person) => {
  return {
    name: person.name,
    number: person.number,
    id: person._id
  }
}

const Person = mongoose.model('Person', personSchema)

module.exports = Person

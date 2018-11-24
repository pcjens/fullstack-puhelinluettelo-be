require('dotenv').config()
const mongoose = require('mongoose')

mongoose.connect('mongodb://' +
                 process.env.DB_USER + ':' +
                 process.env.DB_PASS + '@' +
                 process.env.DB_CONN, { useNewUrlParser: true })
mongoose.set('useFindAndModify', false)

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    validate: {
      isAsync: true,
      validator: (name, cb) => {
        return Person
          .find({name})
          .then(people => cb(people.length == 0, 'name must be unique'))
      },
    }
  },
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

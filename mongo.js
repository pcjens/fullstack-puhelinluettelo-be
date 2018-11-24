require('dotenv').config()
const mongoose = require('mongoose')

mongoose.connect('mongodb://' +
                 process.env.DB_USER + ':' +
                 process.env.DB_PASS + '@' +
                 process.env.DB_CONN, { useNewUrlParser: true })

const Person = mongoose.model('Person', {
  name: String,
  number: String,
  id: Number
})

const addPerson = (name, number) => {
  Person.find({ name })
    .then(result => {
      if (result.length === 0) {
        console.log(`lisätään henkilö ${name} numero ${number} luetteloon`)
        let newPerson = new Person({
          name, number
        })
        newPerson.save().then(() => {
          mongoose.connection.close()
        })
      } else {
        console.log(`henkilö ${name} löytyy jo tietokannasta!`)
        mongoose.connection.close()
      }
    })
}

const printPeople = () => {
  Person.find({})
    .then(result => {
      console.log('puhelinluettelo:')
      result.forEach(person => {
        console.log(person.name + ' ' + person.number)
      })
      mongoose.connection.close()
    })
}

if (process.argv.length === 4) {
  addPerson(process.argv[2], process.argv[3])
} else if (process.argv.length === 2) {
  printPeople()
} else {
  console.log('Usage:\n' +
              ' node mongo.js\tDisplays the saved numbers\n' +
              ' node mongo.js <name> <number>\tAdds a number in the catalogue')
}

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
morgan.token('payload', (req, res) => { return JSON.stringify(req.body) })
app.use(morgan(":method :url :payload  :status :res[content-length] - :response-time ms"))
app.use(bodyParser.json())
app.use(express.static('build'))
const API_PREFIX = '/api'

const Person = require('./models/person')

app.get('/info', (req, res) => {
  Person
    .find({})
    .then(people => {
      res.type('text/html').send(`<p>Puhelinluettelossa ${people.length} henkilön tiedot.</p>` +
                                 `<p>${new Date()}</p>`)
    })
    .catch(error => {
      console.log(error)
      res.status(404).end()
    })
})

app.get(API_PREFIX + '/persons', (req, res) => {
  Person
    .find({})
    .then(people => {
      res.json(people.map(Person.format))
    })
    .catch(error => {
      console.log(error)
      res.status(404).end()
    })
})

app.post(API_PREFIX + '/persons', (req, res) => {
  let body = req.body;
  if (!body.name) {
    res.status(400).json({ error: 'name missing' })
  } else if (!body.number) {
    res.status(400).json({ error: 'number missing' })
  } else {
    Person
      .find({ name: body.name })
      .then(result => {
        if (result.length == 0) {
          let newPerson = new Person({
            name: body.name,
            number: body.number,
            id: Math.floor(Math.pow(2, 31) * Math.random())
          })
          newPerson.save()
            .then(person => {
              res.json(Person.format(person))
            })
            .catch(error => {
              console.log(error)
              res.status(500).end()
            })
        } else {
          res.status(400).json({ error: 'name must be unique' })
        }
      })
      .catch(error => {
        console.log(error)
        res.status(500).end()
      })
  }
})

app.get(API_PREFIX + '/persons/:id', (req, res) => {
  Person
    .findById(req.params.id)
    .then(people => {
      if (people.length >= 1) {
        res.json(Person.format(people[0]))
      } else {
        res.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)
      res.status(400).send({ error: 'malformatted id' })
    })
})

app.delete(API_PREFIX + '/persons/:id', (req, res) => {
  res.status(500/*204*/).end()
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

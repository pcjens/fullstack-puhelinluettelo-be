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
    let newPerson = new Person({
      name: body.name,
      number: body.number,
    })
    newPerson.save()
      .then(person => {
        res.json(Person.format(person))
      })
      .catch(error => {
        if (error.name === 'ValidationError') {
          res.status(400).send({ error: error.errors['name'].message })
        } else {
          console.log(error)
          res.status(500).end()
        }
      })
  }
})

app.put(API_PREFIX + '/persons/:id', (req, res) => {
  let body = req.body;
  if (!body.number) {
    res.status(400).json({ error: 'number missing' })
  } else {
    const updatedFields = {
      number: body.number
    }
    Person
      .findByIdAndUpdate(req.params.id, updatedFields, { new: true })
      .then(updatedPerson => {
        res.json(Person.format(updatedPerson))
      })
      .catch(error => {
        console.log(error)
        res.status(400).send({ error: 'malformatted id' })
      })
  }
})

app.get(API_PREFIX + '/persons/:id', (req, res) => {
  Person
    .findById(req.params.id)
    .then(person => {
      res.json(Person.format(person))
    })
    .catch(error => {
      res.status(400).send({ error: 'malformatted id' })
    })
})

app.delete(API_PREFIX + '/persons/:id', (req, res) => {
  Person
    .findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => {
      res.status(400).send({ error: 'malformatted id' })
    })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

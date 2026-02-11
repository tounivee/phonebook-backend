require('dotenv').config()
const express = require('express')
var morgan = require('morgan')

const Person = require('./models/person')

const app = express()

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  console.log('error.name:', error.name)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(express.json())

// Create token + Stringify
morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

// Log request
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body'),
)

// First check if the dist directory contains a file corresponding to the request's address
app.use(express.static('dist'))

app.put('/api/persons/:id', async (request, response, next) => {
  const { name, number } = request.body

  try {
    const updatedPerson = await Person.findByIdAndUpdate(
      request.params.id,
      { name, number },
      {
        new: true,
        runValidators: true,
        context: 'query',
      },
    )

    if (!updatedPerson) {
      return response.status(404).json({ error: 'Person not found' })
    }

    response.json(updatedPerson)
  } catch (error) {
    next(error)
  }
})

app.post('/api/persons', async (request, response, next) => {
  const { name, number } = request.body

  if (!name) {
    return response.status(400).json({
      error: 'Name is missing',
    })
  } else if (!number) {
    return response.status(400).json({
      error: 'Number is missing',
    })
  }

  const person = new Person({ name, number })
  person
    .save()
    .then((result) => {
      console.log(result)
      response.json(result)
      // response.status(201).json({
      //   action: "created",
      //   person: result,
      // })
    })
    .catch((error) => next(error))
})

app.get('/info', async (req, res) => {
  const total = await Person.countDocuments()

  res.send(`
    <p>Phonebook has info for ${total} people</p>
    <p>${new Date()}</p>
  `)
})

app.get('/api/persons', (request, response) => {
  // response.json(persons);
  Person.find({}).then((result) => {
    response.json(result)
  })
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  Person.findById(id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => {
      console.log(error)
      response.status(500).end()
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      console.log(result)
      response.status(204).end()
    })
    .catch((error) => next(error))
})

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

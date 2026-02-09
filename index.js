require("dotenv").config()
const express = require("express")
var morgan = require("morgan")

const Person = require("./models/person")

const app = express()

// let persons = [
//   {
//     id: "1",
//     name: "Arto Hellas",
//     number: "040-123456",
//   },
//   {
//     id: "2",
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//   },
//   {
//     id: "3",
//     name: "Dan Abramov",
//     number: "12-43-234345",
//   },
//   {
//     id: "4",
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//   },
// ]

// const nameExists = (name) => {
//   return persons.some((person) => String(person.name) === String(name))
// }

const generateId = (max = 1000000000) => {
  return Math.floor(Math.random() * max)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" })
  }

  next(error)
}

app.use(express.json())

// Create token + Stringify
morgan.token("body", (req) => {
  return JSON.stringify(req.body)
})

// Log request
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body"),
)

// First check if the dist directory contains a file corresponding to the request's address
app.use(express.static("dist"))

app.post("/api/persons", (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: "Name is missing",
    })
  } else if (!body.number) {
    return response.status(400).json({
      error: "Number is missing",
    })
  }
  // } else if (nameExists(body.name)) {
  //   return response.status(400).json({
  //     error: "Name must be unique",
  //   })
  // }

  const person = new Person({
    name: body.name,
    number: body.number || false,
  })

  person.save().then((newPerson) => {
    response.json(newPerson)
  })
})

// app.get("/", (request, response) => {
//   response.send("<h1>Hello World!</h1>")
// })

app.get("/info", async (req, res) => {
  const total = await Person.countDocuments()

  res.send(`
    <p>Phonebook has info for ${total} people</p>
    <p>${new Date()}</p>
  `)
})

app.get("/api/persons", (request, response) => {
  // response.json(persons);
  Person.find({}).then((result) => {
    response.json(result)
  })
})

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id
  Person.findById(request.params.id)
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
    .then(result => {
      console.log(result)
      response.status(204).end()
    })
    .catch(error => next(error))
})


// handler of requests with unknown endpoint
app.use(unknownEndpoint)

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

require('dotenv').config()

const cors = require('cors')
const express = require('express')
const connectDatabase = require('./config/database')
const studentRoutes = require('./routes/studentRoutes')

const app = express()
const port = Number(process.env.PORT) || 5000

app.use(cors())
app.use(express.json({ limit: '20kb' }))
app.use('/api/students', studentRoutes)

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error)
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' })
  }
  console.error('Request failed:', error)
  return res.status(500).json({ message: 'An unexpected server error occurred.' })
})

async function startServer() {
  try {
    await connectDatabase()
    app.listen(port, () => console.log(`Registration API listening on port ${port}.`))
  } catch (error) {
    console.error('Unable to start the registration API:', error.message)
    process.exitCode = 1
  }
}

if (require.main === module) {
  startServer()
}

module.exports = app

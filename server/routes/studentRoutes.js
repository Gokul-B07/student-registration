const express = require('express')
const { listStudents, registerStudent } = require('../controllers/studentController')

const router = express.Router()

router.get('/', listStudents)
router.post('/', registerStudent)

module.exports = router

const Student = require('../models/Student')
const { COMPANY_NAMES } = Student

const REQUIRED_TEXT_FIELDS = [
  ['name', 120],
  ['studentId', 32],
  ['department', 120],
  ['section', 20],
  ['fatherName', 120],
  ['motherName', 120],
  ['email', 254],
]

function validateStudent(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Provide student registration details.'
  }

  for (const [field, maxLength] of REQUIRED_TEXT_FIELDS) {
    if (typeof body[field] !== 'string' || !body[field].trim()) {
      return `${field} is required.`
    }
    if (body[field].trim().length > maxLength) {
      return `${field} must be no more than ${maxLength} characters.`
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    return 'Enter a valid email address.'
  }

  if (!['1st year', '2nd year', '3rd year', '4th year'].includes(body.year)) {
    return 'Select a valid year of study.'
  }

  if (!['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(body.bloodGroup)) {
    return 'Select a valid blood group.'
  }

  if (!Number.isInteger(body.arrears) || body.arrears < 0 || body.arrears > 99) {
    return 'Standing arrears must be a whole number between 0 and 99.'
  }
  if (body.arrears !== 0) {
    return 'Students with standing arrears are not eligible to register for placements.'
  }

  if (!Array.isArray(body.companies) || body.companies.length !== 4
    || new Set(body.companies).size !== 4
    || body.companies.some((company) => !COMPANY_NAMES.includes(company))) {
    return 'Choose exactly four different valid companies.'
  }

  return null
}

async function listStudents(req, res, next) {
  try {
    const students = await Student.find().sort({ registeredAt: -1 }).lean()
    res.json({ students })
  } catch (error) {
    next(error)
  }
}

async function registerStudent(req, res, next) {
  const validationError = validateStudent(req.body)
  if (validationError) {
    return res.status(400).json({ message: validationError })
  }

  const student = Object.fromEntries(REQUIRED_TEXT_FIELDS.map(([field]) => [field, req.body[field].trim()]))
  student.year = req.body.year
  student.bloodGroup = req.body.bloodGroup
  student.arrears = req.body.arrears
  student.companies = req.body.companies

  try {
    const savedStudent = await Student.findOneAndUpdate(
      { studentId: student.studentId },
      { $set: student, $setOnInsert: { registeredAt: new Date() } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    )
    res.status(201).json({ student: savedStudent })
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0]
      const message = duplicateField === 'email'
        ? 'A registration already exists for this email address.'
        : duplicateField === 'studentId'
          ? 'A registration already exists for this student ID.'
          : 'A registration already exists for this student ID or email address.'
      return res.status(409).json({ message })
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message })
    }
    return next(error)
  }
}

module.exports = { listStudents, registerStudent, validateStudent }

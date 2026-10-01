const mongoose = require('mongoose')

const COMPANY_NAMES = [
  'Vibro',
  'HCL',
  'TCS',
  'Infosys',
  'Wipro',
  'Accenture',
  'Cognizant',
  'Capgemini',
  'Zoho',
  'Amazon',
]

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  studentId: { type: String, required: true, trim: true, maxlength: 32, unique: true },
  department: { type: String, required: true, trim: true, maxlength: 120 },
  year: { type: String, required: true, enum: ['1st year', '2nd year', '3rd year', '4th year'] },
  section: { type: String, required: true, trim: true, maxlength: 20 },
  bloodGroup: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  fatherName: { type: String, required: true, trim: true, maxlength: 120 },
  motherName: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254, unique: true },
  arrears: { type: Number, required: true, min: 0, max: 99, validate: Number.isInteger },
  companies: {
    type: [{ type: String, enum: COMPANY_NAMES }],
    required: true,
    validate: {
      validator: (companies) => companies.length === 4 && new Set(companies).size === 4,
      message: 'Choose exactly four different companies.',
    },
  },
  registeredAt: { type: Date, default: Date.now },
}, { timestamps: true })

module.exports = mongoose.model('Student', studentSchema)
module.exports.COMPANY_NAMES = COMPANY_NAMES

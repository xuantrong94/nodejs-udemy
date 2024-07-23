const mongoose = require('mongoose') // Erase if already required
const bcrypt = require('bcryptjs')
// Declare the Schema of the Mongo model
// name, email, password, passwordConfirm
const DOCUMENT_NAME = 'User'
const COLLECTION_NAME = 'Users'
var userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please tell us your name'],
			index: true,
		},
		email: {
			type: String,
			required: [true, 'Please tell us your email'],
			unique: true,
			lowercase: true,
		},
		photo: String,
		password: {
			type: String,
			required: [true, 'Please provide a password'],
			minLength: 8,
		},
		confirmPassword: {
			type: String,
			required: [true, 'Please confirm your password'],
			validate: {
				validator: function (val) {
					return val === this.password
				},
				message: 'Passwords are not the same',
			},
		},
	},
	{
		timestamps: true,
		collection: COLLECTION_NAME,
	}
)

userSchema.pre('save', async function (next) {
	// Only run this function if password was actually modified
	if (!this.isModified('password')) return next()

	// hash the password with cost of 12
	this.password = await bcrypt.hash(this.password, 10)

	// delete passwordConfirm field
	this.confirmPassword = undefined
	next()
})

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, userSchema)

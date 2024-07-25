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
			select: false,
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
		passwordChangedAt: {
			type: Date,
			select: false,
		},
	},
	{
		timestamps: true,
		collection: COLLECTION_NAME,
	}
)

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
	return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.pre('save', async function (next) {
	// Only run this function if password was actually modified
	if (!this.isModified('password')) return next()

	// hash the password with cost of 12
	this.password = await bcrypt.hash(this.password, 10)

	// delete passwordConfirm field
	this.confirmPassword = undefined
	next()
})

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
		return JWTTimestamp < changedTimestamp
	}

	// If password hasn't been changed, return false
	return false
}

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, userSchema)

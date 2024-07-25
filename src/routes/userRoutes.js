const express = require('express')
const userControllers = require('../controllers/userControllers')
const authControllers = require('../controllers/authControllers')

const router = express.Router()

router.post('/signup', authControllers.signup)
router.post('/login', authControllers.login)
router.post('/forgot-password', authControllers.login)
router.post('/reset-password', authControllers.login)

router
	.route('/')
	.get(authControllers.protect, userControllers.getAllUsers)
	.post(userControllers.createUser)

router
	.route('/:id')
	.get(userControllers.getUser)
	.patch(userControllers.updateUser)
	.delete(userControllers.deleteUser)

module.exports = router

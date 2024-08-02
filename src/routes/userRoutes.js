const express = require('express')
const userControllers = require('../controllers/userControllers')
const authControllers = require('../controllers/authControllers')

const router = express.Router()

router.post('/signup', authControllers.signup)
router.post('/login', authControllers.login)
router.get(
	'/me',
	authControllers.protect,
	userControllers.getCurrent,
	userControllers.getUser
)

router.post('/forgot-password', authControllers.forgotPassword)
router.patch('/reset-password/:token', authControllers.resetPassword)
router.patch(
	'/update-password',
	authControllers.protect,
	authControllers.updatePassword
)

router
	.route('/')
	.get(authControllers.protect, userControllers.getAllUsers)
	.post(userControllers.createUser)

router
	.route('/:id')
	.get(userControllers.getMember)
	.patch(authControllers.protect, userControllers.updateUser)
	.delete(authControllers.protect, userControllers.deleteUser)

module.exports = router

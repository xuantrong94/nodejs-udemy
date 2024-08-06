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

router.use(authControllers.protect)

router.route('/').get(userControllers.getAllUsers)

router
	.route('/:id')
	.get(userControllers.getMember)
	.patch(userControllers.updateUser)
	.delete(userControllers.deleteUser)

router
	.route('/admin/:userId')
	.patch(
		authControllers.restrictTo('admin'),
		userControllers.uploadUserPhoto,
		userControllers.resizeUserPhoto,
		userControllers.updateMember
	)
module.exports = router

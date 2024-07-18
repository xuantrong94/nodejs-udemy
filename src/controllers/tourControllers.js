exports.checkBody = (req, res, next) => {
	if (!req.body.name || !req.body.price) {
		return res.status(400).json({
			status: 'fail',
			message: 'Missing name or price',
		})
	}
	next()
}

exports.getTour = (req, res) => {
	res.send('Get Tour')
}

exports.updateTour = (req, res) => {
	res.send('Update Tour')
}

exports.deleteTour = (req, res) => {
	res.send('Delete Tour')
}

exports.getAllTours = (req, res) => {
	res.send('Get all Tours')
}

exports.createTour = (req, res) => {
	res.send('Create Tour')
}

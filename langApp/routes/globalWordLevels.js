var express = require('express');
var router = express.Router();
var GlobalWordLevel = require('../models/globalWordLevel');

router.get('/', function(req, res, next) {
	if (!req.user || req.user.username != 'rkdrnf') res.redirect('/');
	
	GlobalWordLevel.find({}, function(err, words) {
		res.render('globalWordLevels/index', { words: words});	
	});
})


router.post('/delete', function(req, res, next) {
	GlobalWordLevel.findOne({ _id: req.param('_id') }, function (err, wordLevel) {
		wordLevel.remove();
	});	
	
	res.redirect('/globalWordLevels');
})

module.exports = router;

var express = require('express');
var router = express.Router();
var WordLevel = require('../models/wordLevel');

router.get('/', function(req, res, next) {
	if (!req.user || req.user.username != 'rkdrnf') res.redirect('/');
	
	WordLevel.find({}, function(err, words) {
		res.render('wordLevels/index', { words: words});	
	});
})


router.post('/delete', function(req, res, next) {
	WordLevel.findOne({ _id: req.param('_id') }, function (err, wordLevel) {
		wordLevel.remove();
	});	
	
	res.redirect('/wordLevels');
})

module.exports = router;
var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
var http = require('http');
var Word = require('../models/word');
var WordLevel = require('../models/wordLevel');
var GlobalWordLevel = require('../models/globalWordLevel');
require('array.prototype.find');

/* GET home page. */
router.get('/', function(req, res, next) {
	Word.find({}, function(err, words) {
		res.render('index', { user: req.user, title: 'Main Page', words: words });
	});
});

router.get('/register', function(req, res) {
	res.render('register', {});
});

router.post('/register', function(req, res) {
	Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
		if (err) {
			return res.render('register', { account : account });
		}

		passport.authenticate('local')(req, res, function () {
			res.redirect('/');
		});
	});
});

router.get('/login', function(req, res) {
	res.render('login', { user: req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
	res.redirect('/');
});

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

router.post('/wordQuizAnswer', function(req, res) {
	var word = req.param('word');
	var correct = req.param('correct') === 'true';
	
	if (req.user) {
		WordLevel.findOne({ owner: req.user._id, word: word }, function(err, wordLevel) {
			if (wordLevel == null) {
				WordLevel.create({ 
					owner: req.user._id, 
					word: word, 
					level: 1, 
					triedNumber: 1, 
					matchedNumber: correct ? 1 : 0
				}, function(err, newWL) {
					Word.update({ _id: word }, { $addToSet: { level: newWL._id }});
				});
			} else {
				wordLevel.triedNumber += 1;
				wordLevel.matchedNumber += correct ? 1 : 0;
				wordLevel.level = Math.max(1, wordLevel.triedNumber - wordLevel.matchedNumber);
				wordLevel.save();
			}
		});
	}
	
	GlobalWordLevel.findOne({ word: word }, function (err, gWL) {
		gWL.matchedNumber += correct ? 1 : 0;
		gWL.triedNumber += 1;
		gWL.level = Math.max(1, gWL.matchedNumber - gWL.triedNumber);
		gWL.save();
	});
		
		
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({success: true}));
});

router.post('/loadQuiz', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	
	var selectCount = 100;
	
	if (!req.user) {
		Word.find({}).count(function(err, count) {
			Word.find({}).skip(Math.floor(Math.random() * (count - selectCount))).limit(selectCount).lean().exec(function(err, words) {
				res.send(JSON.stringify(words));
			});
		});
		
		return;
	}
	
	var quizType = req.param('quizType');
	
	if (quizType === 'All') {
		Word.find({ ignores: { $ne: req.user._id }}).count(function(err, count) {
			Word.find({ ignores: { $ne: req.user._id }}).skip(Math.floor(Math.random() * (count - selectCount))).limit(selectCount).lean().exec(function(err, words) {
				words.forEach(function(word) {
					word.watching = word.watchings.find(function (wat) {
						return wat.id == req.user._id.id;
					}) !== undefined;
					word.ignoring = word.ignores.find(function (ign) {
						return ign.id == req.user._id.id;
					}) !== undefined;
				})
				res.send(JSON.stringify(words));
			});
		});
		return;
	}
	
	if (quizType === 'Watching') {
		Word.find({ 'watchings': req.user._id }).lean().exec(function(err, words) {
			words.forEach(function(word) {
				word.watching = true;
				word.ignoring = word.ignores.find(function (ign) {
					return ign.id == req.user._id.id;
				}) !== undefined;
			})
			res.send(JSON.stringify(words));
		});
		return;
	}
	
	if (quizType === 'Abandoned') {
		Word.find({ ignores: req.user._id }).lean().exec(function(err, words) {
			words.forEach(function(word) {
				word.watching = word.watchings.find(function (wat) {
					return wat.id == req.user._id.id;
				}) !== undefined;
				word.ignoring = true;
			})
			res.send(JSON.stringify(words));
		});
		return;
	}
	
	Word.find({'ignores': { $ne: req.user._id }}).populate('level', null, { owner: req.user._id }).count(function(err, count) {	
		Word.find({'ignores': { $ne: req.user._id }}).populate('level', null, { owner: req.user._id })
		.skip(Math.floor(Math.random() * (count - selectCount))).limit(selectCount).lean().exec(function (err, words) {
			words.forEach(function(word) {
					word.watching = word.watchings.find(function (wat) {
						return wat.id == req.user._id.id;
					}) !== undefined;
					word.ignoring = word.ignores.find(function (ign) {
						return ign.id == req.user._id.id;
					}) !== undefined;
			})
			res.send(JSON.stringify(words));
			return;
		});
	});
});

module.exports = router;

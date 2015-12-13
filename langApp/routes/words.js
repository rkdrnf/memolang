var express = require('express');
var router = express.Router();
var Word = require('../models/word');
var WordLevel = require('../models/wordLevel');
var GlobalWordLevel = require('../models/globalWordLevel');

router.get('/', function(req, res, next) {
	if (!req.user || req.user.username != 'rkdrnf') res.redirect('/');
	
	Word.find({}, function(err, words) {
		res.render('words/index', { words: words});	
	});
})

router.post('/deleteAll', function(req, res, next) {
	Word.remove({}, function(err) {});
	WordLevel.remove({}, function(err) {});
	GlobalWordLevel.remove({}, function(err) {});
	
	res.redirect('/words');
});

router.post('/delete', function(req, res, next) {
	Word.remove({ _id: req.param('_id') }, function (err) {
	});	
	
	res.redirect('/words');
})

router.post('/addWatch', function (req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	var watch = req.param('watch') === 'true';
	var word = req.param('word');
	
	if (!req.user) {
		res.send(JSON.stringify({ error: true }));
		return;
	}
	
	if (watch) {
		Word.update({ _id: word }, { $addToSet: { watchings: req.user._id }}, function (err, count) {
			res.send(JSON.stringify({ success: true }));
		})
	} else {
		Word.update({ _id: word }, { $pull: { watchings: req.user._id }}, function (err, count) {
			res.send(JSON.stringify({ success: true }));
		});
	}
})

router.post('/ignore', function (req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	var ignore = req.param('ignore') === 'true';
	
	if (!req.user) {
		res.send(JSON.stringify({ error: true }));
		return;
	}
	
	if (ignore) {
		Word.update({ _id: req.param('word') }, { $addToSet: { ignores: req.user._id }}, function(err) {
			res.send(JSON.stringify({ success: true }));
		});
	} else {
		Word.update({ _id: req.param('word') }, { $pull: { ignores: req.user._id }}, function (err) {
			res.send(JSON.stringify({ success: true }));
		});
	}
})

router.post('/register', function (req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	
	var text = req.param('text');
	
	//if text is pronounciation, convert to appropriate string
	if (containsAlphabet(text)) {
		res.send(JSON.stringify({ error: 'alphabet input' }));
		return;
	}
	
	Word.create({ text: text, meaning: req.param('meaning'), desc: req.param('desc')}, function(err, word) {
		if (err) { 
			res.send(JSON.stringify({ error: err }));
			return;
		}
		
		GlobalWordLevel.create({ word: word._id, level: 1, triedNumber: 0, matchedNumber: 0 }, function(err, gWL) {
			if (err) console.log('globalwordLevel creation failure');
			
			word.globalLevel = gWL._id;
			word.save();
		});
		
		if (req.user) {
			WordLevel.create({ owner: req.user._id, word: word._id, level: 1, triedNumber: 0, matchedNumber: 0 }, function(err, WL) {
				if (err) console.log('wordLevel creation failure');
				
				Word.update({ _id: word._id }, { $addToSet: { level: WL._id }}, function(err) {}); 			
			});
		}
	});
	
	res.send(JSON.stringify({ success: true}));
	
	return;
});

function containsNonLatinCodepoints(s) {
	return /[^\u0000-\u00ff]/.test(s);
}

function containsAlphabet(s) {
	return /[a-zA-Z0-9]/.test(s)
}

module.exports = router;


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
});

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
			if (err) {
				res.send(JSON.stringify({ error: true, message: err }));
				return;	
			}  
			
			res.send(JSON.stringify({ success: true }));
		})
	} else {
		Word.update({ _id: word }, { $pull: { watchings: req.user._id }}, function (err, count) {
			if (err) {
				res.send(JSON.stringify({ error: true, message: err }));
				return;
			}
			
			res.send(JSON.stringify({ success: true }));
		});
	}
});

router.post('/ignore', function (req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	var ignore = req.param('ignore') === 'true';
	
	if (!req.user) {
		res.send(JSON.stringify({ error: true }));
		return;
	}
	
	if (ignore) {
		Word.update({ _id: req.param('word') }, { $addToSet: { ignores: req.user._id }}, function(err) {
			if (err) {
				res.send(JSON.stringify({ error: true, message: err }));
				return;	
			}
			  
			res.send(JSON.stringify({ success: true }));
		});
	} else {
		Word.update({ _id: req.param('word') }, { $pull: { ignores: req.user._id }}, function (err) {
			if (err) {
				res.send(JSON.stringify({ error: true, message: err }));
				return;	
			}  
			
			res.send(JSON.stringify({ success: true }));
		});
	}
});

router.post('/register', function (req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	
	var text = req.param('text');
	var meanings = req.param('meaning').trim().split(';');
	meanings.forEach(function(meaning) {
		meaning = meaning.trim();
	}); 
	meanings = meanings.filter(function(meaning) {
		return meaning.length > 0;
	});
	
	var descs = req.param('desc').trim().split('\n');
	descs.forEach(function(desc) {
		desc = desc.trim();
	});
	
	Word.create({ text: text, meaning: meanings, desc: descs}, function(err, word) {
		if (err) { 
			res.send(JSON.stringify({ error: true, message: err }));
			return;
		}
		
		var noError = true;
		
		GlobalWordLevel.create({ word: word._id, level: 1, triedNumber: 0, matchedNumber: 0 }, function(err, gWL) {
			if (err) {
				noError = false;
				res.send(JSON.stringify({ error: true, message: err }));
				console.log('GlobalWordLevel Creation Failed');
			}
			
			word.globalLevel = gWL._id;
			word.save();
		});
		
		if (req.user) {
			WordLevel.create({ owner: req.user._id, word: word._id, level: 1, triedNumber: 0, matchedNumber: 0 }, function(err, WL) {
				if (err) {
					noError = false;
					res.send(JSON.stringify({ error: true, message: err }));
					console.log('WordLevel Creation Failed');
				}
				
				Word.update({ _id: word._id }, { $addToSet: { level: WL._id }}, function(err) {});
				
				if (noError) res.send(JSON.stringify({ success: true })); 
			});
		} else {
			if (noError) res.send(JSON.stringify({ success: true }));
		}
	});
	
	return;
});

router.post('/update', function (req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	
	if (!req.user) {
		res.send(JSON.stringify({ error: true, message: '로그인해주세요'}));
		return;
	}
	
	var text = req.param('text').trim();
	var pinyins = req.param('pinyin').trim().split(';');
	pinyins.forEach(function(pinyin) {
		pinyin = pinyin.trim();
	});
	var pronuns = req.param('pronunciation').trim().split(';');
	pronuns.forEach(function(pronun) {
		pronun = pronun.trim();
	});
	var meanings = req.param('meaning').trim().split(';');
	meanings.forEach(function(meaning) {
		meaning = meaning.trim();
	});
	meanings = meanings.filter(function(meaning) {
		return meaning.length > 0;
	});
	
	var descs = req.param('desc').trim().split('\n');
	descs.forEach(function(desc) {
		desc = desc.trim();
	});
	var _id = req.param('_id');
	
	Word.update({ _id: _id }, { text: text, pinyin: pinyins, pronun: pronuns, meaning: meanings, desc: descs }, function (err, count) {
		if (err) {
			res.send(JSON.stringify({ error: true, message: err}));
			console.log('Word Update Failed');
		} else {
			res.send(JSON.stringify({ success: true }));
		}
	});
});

router.post('/deleteAjax', function (req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	
	if (!req.user) {
		res.send(JSON.stringify({ error: true, message: '로그인해주세요'}));
		return;
	}
	
	var _id = req.param('_id');
	
	Word.remove({ _id: _id }, function(err) {
		if (err) res.send(JSON.stringify({ error: true, message: err }));
	});
	
	WordLevel.remove({ word: _id }, function (err) {
		if (err) res.send(JSON.stringify({ error: true, message: err }));
	})
	
	GlobalWordLevel.remove({ word: _id }, function (err) {
		if (err) res.send(JSON.stringify({ error: true, message: err }));
	})
	
	res.send(JSON.stringify({ success: true }));
});

function containsNonLatinCodepoints(s) {
	return /[^\u0000-\u00ff]/.test(s);
}

function containsAlphabet(s) {
	return /[a-zA-Z0-9]/.test(s)
}

router.post('/search', function (req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	
	var type = req.param('type');
	var text = req.param('text');
	//sort in client
	var re = new RegExp(text, "gi");
	
	if (type === 'text') {
		Word.find({ text: re }).lean().exec(function(err, words) {
			if (err) {
				res.send(JSON.stringify({ error: true, message: err }));
				return;
			} 
			
			res.send(JSON.stringify(words));
		});
	} else if (type === 'meaning') {
		Word.find({ meaning: re }).lean().exec(function(err, words) {
			if (err) {
				res.send(JSON.stringify({ error: true, message: err }));
				return;
			} 
			
			res.send(JSON.stringify(words));
		});
	}
	
});

module.exports = router;


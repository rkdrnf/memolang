var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/passport_local_mongoose_express4');

var Word = require('../models/word');

Word.find({}, function(err, words) {
	words.forEach(function(word) {
		var re = new RegExp('5', 'g');
		
		word.pinyin = word.pinyin.replace(re, '');
		word.save();
	});
});

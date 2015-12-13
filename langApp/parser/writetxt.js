var fs = require('fs');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/passport_local_mongoose_express4');

var Word = require('../models/word');
var writeStr = [];

Word.find({}, function(err, words) {
	words.forEach(function(word) {
		var text = word.text;
		var pinyin = word.pinyin ? word.pinyin.join(';') : '';
		var pronun = word.pronunciation ? word.pronunciation.join(';') : '';
		var meaning = word.meaning ? word.meaning.join(';') : '';
		
		var line = [text, pinyin, pronun, meaning].join('\t');
		writeStr.push(line);
	});
	
	fs.writeFile('./result.txt', writeStr.join('\r\n'), function(err) {
		console.log('done');
	});
});

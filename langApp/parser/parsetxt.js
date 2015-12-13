var fs = require('fs');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/passport_local_mongoose_express4');

var Word = require('../models/word');
var GlobalWordLevel = require('../models/globalWordLevel');

fs.readFile('./hsk4.txt', 'utf-8', function (err, data) {
	if (err) {
		return console.log(err);
	}
	
	var lines = data.split('\n');
	console.log('total line = '  + lines.length);
	lines.forEach(function(line) {
		line = line.trim();
		var columns = line.split('\t');
		if (columns.length < 2) { return;}
		var word = columns[0].trim();
		var pinyin = columns[1].trim().split(';');
		var pronun = columns[2].trim().split(';');
		var meaning = columns[3].trim().split(';');
		
		/*
		Word.update({ text: word }, { pinyin: [pinyin] }, function(err) {
			if (err) console.log('update failed' + word);
		});
		*/
		
		//처음 넣을떄 썼음
		Word.create({ text: word, pinyin: pinyin, meaning: meaning, pronunciation: pronun }, function(err, word) {
			if (err) { return; }
			
			GlobalWordLevel.create({ word: word._id, level: 1, triedNumber: 0, matchedNumber: 0 }, function(err, gWL) {
				word.globalLevel = gWL._id;
				word.save();
			});
		});
	})
});
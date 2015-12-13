var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GlobalWordLevel = new Schema({
	word: { type: Schema.Types.ObjectId, ref: 'Word', index: { unique: true }},
	level: Number,
	triedNumber: Number,
	matchedNumber: Number
});

module.exports = mongoose.model('GlobalWordLevel', GlobalWordLevel);
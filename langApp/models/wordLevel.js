var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WordLevel = new Schema({
	owner: { type: Schema.Types.ObjectId, ref: 'Account' },
	word: { type: Schema.Types.ObjectId, ref: 'Word' },
	level: Number,
	triedNumber: Number,
	matchedNumber: Number
});

WordLevel.index({ owner: 1, word: 1 }, { unique: true });

module.exports = mongoose.model('WordLevel', WordLevel);
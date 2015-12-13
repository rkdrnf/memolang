var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Word = new Schema({
	text: { type: String, index: { unique: true }},
	meaning: [String],
	pinyin: [String],
	pronunciation: [String],
	desc: [String],
	level: [{ type: Schema.Types.ObjectId, ref: 'WordLevel' }],
	globalLevel: { type: Schema.Types.ObjectId, ref: 'GlobalWordLevel' },
	watchings: [{ type: Schema.Types.ObjectId, ref: 'Account' }],
	ignores: [{ type: Schema.Types.ObjectId, ref: 'Account' }]
});

module.exports = mongoose.model('Word', Word);
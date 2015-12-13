var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/passport_local_mongoose_express4');
var Word = require('../models/word');
var GlobalWordLevel = require('../models/globalWordLevel');
var fs = require('fs');

var PDFParser = require('pdf2json/pdfparser');




var parsePDf = module.exports = function () {};


parsePDF.prototype.parse = function () {
	var pdfParser = new PDFParser();
	pdfParser.on("pdfParser_dataReady", _.bind(_onPFBinDataReady, self));

	pdfParser.on("pdfParser_dataError", _.bind(_onPFBinDataError, self));

	var pdfFilePath =  "./target.pdf";

	pdfParser.loadPDF(pdfFilePath);

	// or call directly with buffer
	fs.readFile(pdfFilePath, function (err, pdfBuffer) {
		if (!err) {
			pdfParser.parseBuffer(pdfBuffer);
		}
	})
}
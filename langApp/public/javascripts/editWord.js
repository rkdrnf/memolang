$(function() {
	var boxPath ='#editWordBox #editWordForm';
		
	$(document).on('click', boxPath + ' #submitButton', OnClickSubmit);
	
	
	HideResultAll();
	
	
	function HideResultAll() {
		$(boxPath + ' .result-row span').hide();
	}
	
	function ShowLoading() {
		$(boxPath + ' .result-row #ok').hide();
		$(boxPath + ' .result-row #error').hide();
		$(boxPath + ' .result-row #loading').show();
		$(boxPath + ' .result-row #message').text('');
	}
	
	function ShowOK() {
		$(boxPath + ' .result-row #error').hide();
		$(boxPath + ' .result-row #loading').hide();
		$(boxPath + ' .result-row #ok').show();
		$(boxPath + ' .result-row #message').text('');
	}
	
	function ShowError(res) {
		$(boxPath + ' .result-row #ok').hide();
		$(boxPath + ' .result-row #loading').hide();
		$(boxPath + ' .result-row #error').show();
		$(boxPath + ' .result-row #message').text(res.message.errmsg);
	}
	
	
	function OnClickSubmit(e) {
		e.preventDefault();
		
		ShowLoading();
		
		var text = $(boxPath + ' input#text').val();
		var pinyin = $(boxPath + ' input#pinyin').val();
		var pronunciation = $(boxPath + ' input#pronunciation').val();
		var meaning = $(boxPath + ' input#meaning').val();
		var desc = $(boxPath + ' input#desc').val();
		var _id = $(boxPath + ' input#wordID').val();
		
		$.ajax({
			url: '/words/update',
			type: 'POST',
			dataType: 'json',
			data: {_id: _id, text: text, pinyin: pinyin, pronunciation: pronunciation, meaning: meaning, desc: desc},
			error: function(e) {
				ShowError();
			},
			success: function(res) {
				if (res.error) {
					ShowError(res);
				} else {
					ShowOK();
				}
			}
		});
		
	}
});
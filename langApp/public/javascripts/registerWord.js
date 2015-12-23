$(function() {
	var boxPath ='#regWordBox #regWordForm';
	
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
		
		var text = $('#regWordForm input#text').val();
		var meaning = $('#regWordForm textarea#meaning').val();
		var desc = $('#regWordForm textarea#desc').val();
		
		$.ajax({
			url: '/words/register',
			type: 'POST',
			dataType: 'json',
			data: {text: text, meaning: meaning, desc: desc},
			error: function(e) {
				ShowError();
			},
			success: function(res) {
				if (res.error) {
					ShowError(res);
					console.log(res);
				} else {
					ShowOK();
				}
			}
		});
	}
});
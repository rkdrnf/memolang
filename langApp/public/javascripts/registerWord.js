$(function() {
	$(document).on('click', '#regCharForm #submitButton', OnClickSubmit);
	
	function OnClickSubmit(e) {
		e.preventDefault();
		
		var text = $('#regCharForm input#text').val();
		var meaning = $('#regCharForm input#meaning').val();
		var desc = $('#regCharForm input#desc').val();
		
		$.ajax({
			url: '/words/register',
			type: 'POST',
			dataType: 'json',
			data: {text: text, meaning: meaning, desc: desc},
			error: function(e) {
				alert('error occured');
			},
			success: function(res) {
				alert('registered');
			}
		});
	}
});
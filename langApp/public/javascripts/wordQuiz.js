$(function() {
	$(document).on('click', '#quizBox button#know', OnClickKnow);
	$(document).on('click', '#quizBox button#wrong', OnClickWrong);
	$(document).on('click', '#quizBox #nextBox button#next', OnClickNext);
	$(document).on('click', '#quizBox #endBox button#restart', OnClickRestart);
	$(document).on('click', '#quizBox #preference button#Watch', OnClickWatch);
	$(document).on('click', '#quizBox #preference button#Unwatch', OnClickUnwatch);
	$(document).on('click', '#quizBox #preference button#Ignore', OnClickIgnore);
	$(document).on('click', '#quizBox #preference button#Add', OnClickAdd);	
	$(document).on('change', '#quizBox #quizType select', OnChangeQuizType);
	
	var wordsCount = 0;
	var correctCount = 0;
	var words = [];
	var currentWord = null;
	var quizType = "All";
	
	LoadWords();
	
	function OnChangeQuizType() {
		quizType = $(this).val();
		ShowEnd();
		LoadWords();
	}
	
	function OnClickWatch(e) {
		e.preventDefault()
		
		SendWatch(currentWord, true);
		
		ShowUnwatch();
	}
	
	function OnClickUnwatch(e) {
		e.preventDefault();
		
		SendWatch(currentWord, false);
		
		ShowWatch();
	}
	
	function OnClickIgnore(e) {
		e.preventDefault();
		
		SendIgnore(currentWord, true);
		ShowAdd();
	}
	
	function OnClickAdd(e) {
		e.preventDefault();
		SendIgnore(currentWord, false);
		ShowIgnore();
	}
	
	function SendWatch(word, watch) {
		$.ajax({ 
			url: 'words/addWatch',
			type: 'POST',
			data: { word: word._id, watch: watch },
			dataType: 'json',
			error: function (e) {
				console.log('failed to send watch');
			},
			success: function (e) {
			}
		});
	}
	
	function SendIgnore(word, ignore) {
		$.ajax({
			url: 'words/ignore',
			type: 'POST',
			data: { word: word._id, ignore: ignore },
			dataType: 'json',
			error: function (e) {
				console.log('failed to send ignore');
			},
			success: function (e) {
			}
		});
	}
	
	function OnClickKnow(e) {
		e.preventDefault();
		
		SendAnswer(currentWord, true);
		
		ShowMeaning();
	}
	
	function OnClickWrong(e) {
		e.preventDefault();
		
		SendAnswer(currentWord, false);
		
		ShowMeaning();
	}
	
	function OnClickNext(e) {
		e.preventDefault();
		
		ShowNextQuiz();
	}
	
	function OnClickRestart(e) {
		e.preventDefault();
		
		LoadWords();
	}
		
	function SendAnswer(word, correct) {
		if (correct) {
			correctCount += 1;
		}
		
		$.ajax({
			url: 'wordQuizAnswer',
			type: 'POST',
			dataType: 'json',
			data: { word: word._id, correct: correct },
			error: function (e) {
				console.log('failed to send correct');
			},
			success: function(res) {
				console.log('correct answer');
			}
		});
	}
	
	function ShowMeaning() {
		$('#quizBox #meaningBox').show();
		$('#quizBox #answerBox').hide();
	}
	
	function HideMeaning() {
		$('#quizBox #meaningBox').hide();
		$('#quizBox #answerBox').show();
	}
	
	function ShowNextQuiz() {
		HideMeaning();
		
		if (words.length == 0) {
			ShowEnd();
			return;
		}
		currentWord = words.pop();
		$('#quizBox #text').text(currentWord.text);
		$('#quizBox #meaning').text(currentWord.meaning);
		$('#quizBox #desc').text(currentWord.desc);
		
		if (currentWord.watching) ShowUnwatch();
		else ShowWatch();
		
		if (currentWord.ignoring) ShowAdd();
		else ShowIgnore();
	}
	
	function ShowWatch() {
		$('#quizBox #preference #Watch').show();
		$('#quizBox #preference #Unwatch').hide();
	}
	
	function ShowUnwatch() {
		$('#quizBox #preference #Watch').hide();
		$('#quizBox #preference #Unwatch').show();
	}
	
	function ShowAdd() {
		$('#quizBox #preference #Add').show();
		$('#quizBox #preference #Ignore').hide();
	}
	
	function ShowIgnore() {
		$('#quizBox #preference #Add').hide();
		$('#quizBox #preference #Ignore').show();
	}
	
	function ShowEnd() {
		$('#quizBox #text').text('끝');
		$('#quizBox #endMessage').text('총 ' + wordsCount + '개 중에 ' + correctCount + '개 맞았습니다.');
		$('#quizBox #answerRate').html('정답률은 <b>' + (wordsCount === 0 ? 0 : (correctCount / wordsCount * 100)).toFixed(2) + '%</b> 입니다.');
		$('#quizBox #endBox').show();
		$('#quizBox #answerBox').hide();
		$('#quizBox #preference #Watch').hide();
		$('#quizBox #preference #Unwatch').hide();
		$('#quizBox #preference #Ignore').hide();
		$('#quizBox #preference #Add').hide();
		
		wordsCount = 0;
		correctCount = 0;
	}
	
	function HideEnd() {
		var hideBox = $('#quizBox #endBox');
		console.log(hideBox);
		hideBox.hide();
	}

	function LoadWords() {
		HideEnd();
		$.ajax({
			url: 'loadQuiz', 
			type: 'POST',
			dataType: 'json',
			data: { quizType: quizType },
			error: function(e) {
				console.log('failed to receive words');
			},
			success: function(res) {
				words = shuffle(res);
				wordsCount = words.length;
				ShowNextQuiz();
			}
		});
	}
	
	function shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex ;
		
		// While there remain elements to shuffle...
		while (0 !== currentIndex) {
		
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
		
			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		
		return array;
	}
});
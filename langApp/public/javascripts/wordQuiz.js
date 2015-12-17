$(function() {
	$(document).on('click', '#quizBox button#know', OnClickKnow);
	$(document).on('click', '#quizBox button#wrong', OnClickWrong);
	$(document).on('click', '#quizBox #nextBox button#next', OnClickNext);
	$(document).on('click', '#quizBox #endBox button#restart', OnClickRestart);
	$(document).on('click', '#quizBox #preference button#Watch', OnClickWatch);
	$(document).on('click', '#quizBox #preference button#Unwatch', OnClickUnwatch);
	$(document).on('click', '#quizBox #preference button#Ignore', OnClickIgnore);
	$(document).on('click', '#quizBox #preference button#Add', OnClickAdd);
	$(document).on('click', '#quizBox #preference button#ShowPinyin', OnClickShowPinyin);
	$(document).on('click', '#quizBox #preference button#HidePinyin', OnClickHidePinyin);
	$(document).on('change', '#quizBox #quizType select', OnChangeQuizType);
	
	$(document).on('click', '#quizBox #mainBox button#prevArrow', {dir: 'prev'}, OnClickArrow);
	$(document).on('click', '#quizBox #mainBox button#nextArrow', {dir: 'next'}, OnClickArrow);
	
	$(document).on('click', '#quizBox #searchBox button#search', OnClickSearch);
	
	var wordsCount = 0;
	var correctCount = 0;
	var words = [];
	var currentWord = null;
	var quizType = "All";
	var showPinyin = false;
	var currentIndex = 0;
	
	LoadWords();
	
	OnClickShowPinyin();
	
	function OnClickSearch(e) {
		e.preventDefault();
		var searchType = $('#quizBox #searchBox input[name=searchOption]:checked').val();
		var searchText = $('#quizBox #searchBox #searchText').val();
		
		HideEnd();
		
		$.ajax({
			url: '/words/search',
			type: 'POST',
			dataType: 'json',
			data: { type: searchType, text: searchText },
			error: function (err) {
				console.log('search failed');
			},
			success: function (res) {
				if (res.error) {
					console.log('search failed:' + res.message.errmsg);
					return;
				}
				
				$('#quizBox #searchBox #searchResult').text(res.length + '개 검색되었습니다.'); 
				
				if (searchType === 'text') {
					res.sort(function(a,b) {
						if (a.text.length < b.text.length) {
							return -1;
						} else if (a.text.length === b.text.length) {
							if (a.indexOf(searchText) < b.indexOf(searchText)) return -1;
							else if (a.indexOf(searchText) === b.indexOf(searchText)) return 0;
							else if (a.indexOf(searchText) === b.indexOf(searchText)) return 1;
						} else {
							return 1;
						}
					});
				}
				
				ShowWords(res);
			}
		})
		
	}
	
	function OnClickEditWord(e) {
		e.preventDefault();
	}
	
	function OnClickArrow(e) {
		e.preventDefault();
		
		if (e.data.dir === 'prev') {
			ShowNextQuiz(Math.max(currentIndex - 1, 0));
		} else { 
			ShowNextQuiz(currentIndex + 1);
		}
	}
	
	function OnClickShowPinyin() {
		showPinyin = true;
		
		$('#quizBox #pinyinBox').show();
		$('#quizBox #preference #ShowPinyin').hide();
		$('#quizBox #preference #HidePinyin').show();
	}
	
	function OnClickHidePinyin() {
		showPinyin = false;
		
		$('#quizBox #pinyinBox').hide();
		$('#quizBox #preference #HidePinyin').hide();
		$('#quizBox #preference #ShowPinyin').show();
		
	}
	
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
		
		word.answered = true;
		
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
		$('#quizBox #pinyinBox').show();
	}
	
	function HideMeaning() {
		$('#quizBox #meaningBox').hide();
		$('#quizBox #answerBox').show();
		if (!showPinyin) {
			$('#quizBox #pinyinBox').hide();
		}
	}
	
	function ShowNextQuiz(index) {
		if (index === undefined) {
			index = currentIndex + 1; 
		}
		
		currentIndex = index;
		
		
		if (showPinyin) {
			$('#quizBox #pinyinBox').show();
		}
		
		HideMeaning();
		
		if (words.length === 0 || index === words.length) {
			ShowEnd();
			return;
		}
				
		currentWord = words[index];
		$('#quizBox #text').text(currentWord.text);
		$('#quizBox #pinyinBox #pinyin').text(currentWord.pinyin.join(';'));
		$('#quizBox #meaning').text(currentWord.meaning.join(';'));
		var descs = currentWord.desc;
		descs.forEach(function(desc) {
			desc = desc.trim().replace(/>/, '&gt;').replace(/</, '&lt;');
		});
		
		$('#quizBox #desc').html(descs.join('<br />'));
		
		$('#editWordBox #editWordForm #text').val(currentWord.text);
		$('#editWordBox #editWordForm #pinyin').val(currentWord.pinyin.join(';'));
		$('#editWordBox #editWordForm #pronunciation').val(currentWord.pronunciation.join(';'));
		$('#editWordBox #editWordForm #meaning').val(currentWord.meaning.join(';'));
		$('#editWordBox #editWordForm #desc').val(currentWord.desc.join(';'));
		$('#editWordBox #editWordForm #wordID').val(currentWord._id);
		
		$('#deleteWordBox #deleteWordForm #wordID').val(currentWord._id);
		
		
		if (currentWord.answered) {
			ShowMeaning();
		}
		
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
		$('#quizBox #pinyinBox').hide();
		
		wordsCount = 0;
		correctCount = 0;
	}
	
	function HideEnd() {
		var hideBox = $('#quizBox #endBox');
		hideBox.hide();
	}

	function LoadWords(words) {
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
				var newWords = shuffle(res);
				ShowWords(newWords);
			}
		});
	}
	
	function ShowWords(newWords) {
		words = newWords;
		wordsCount = words.length;
		ShowNextQuiz(0);
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
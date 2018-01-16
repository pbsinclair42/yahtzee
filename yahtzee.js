var rollsSoFar = 0;
var rollsThatWereLeft = 0;
var dice = [];
var lastClicked;
var highscores;
var NUMBER_OF_HIGH_SCORES_SAVED = 10;

// Helper functions

Set.prototype.isSuperset = function(subset) {
    for (var elem of subset) {
        if (!this.has(elem)) {
            return false;
        }
    }
    return true;
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// Yahtzee functions

function roll() {
    return Math.floor((Math.random() * 6) + 1);
}

function calculateScores(dice){
	console.log(dice);

    fillRow('ones', calculateUpperScore(dice, 1));
	fillRow('twos', calculateUpperScore(dice, 2));
    fillRow('threes', calculateUpperScore(dice, 3));
	fillRow('fours', calculateUpperScore(dice, 4));
    fillRow('fives', calculateUpperScore(dice, 5));
	fillRow('sixes', calculateUpperScore(dice, 6));

    fillRow('threeofakind', isNOfAKind(dice, 3) ? sum(dice) : 0);
	fillRow('fourofakind', isNOfAKind(dice, 4) ? sum(dice) : 0);
    fillRow('fullhouse', isFullHouse(dice) ? 25 : 0);
	fillRow('smallstraight', isSmallStraight(dice) ? 30 : 0);
    fillRow('largestraight', isLargeStraight(dice) ? 40 : 0);
	fillRow('yahtzee',  isNOfAKind(dice, 5) ? 50 : 0);
    fillRow('chance', sum(dice))
}

function fillRow(rowId, value){
	$('#'+rowId+' .free').each(function(){
		this.innerHTML = value;
	});
}

function calculateUpperScore(dice, value){
	return dice.filter(function(x){return x==value}).length * value;
}

function sum(dice){
	return dice.reduce((a,b)=>a+b, 0);
}

function isNOfAKind(dice, n){
	var counts = calculateCounts(dice);
	for (var value of counts.values()) {
	    if (value>=n){
	    	return true;
	    }
	}
	return false;
}

function isFullHouse(dice){
	var counts = Array.from(calculateCounts(dice).values());
    return counts.includes(2) && counts.includes(3);
}

function isSmallStraight(dice){
	var dice = new Set(dice);
	return dice.isSuperset(new Set([1,2,3,4])) || dice.isSuperset(new Set([2,3,4,5])) || dice.isSuperset(new Set([3,4,5,6]));
}

function isLargeStraight(dice){
	var dice = new Set(dice);
	return dice.isSuperset(new Set([1,2,3,4,5])) || dice.isSuperset(new Set([2,3,4,5,6]));
}

function calculateCounts(dice){
	var counts = new Map([
		[1, 0],
		[2, 0],
		[3, 0],
		[4, 0],
		[5, 0],
		[6, 0]
		])
	dice.forEach(function(x){
		counts.set(x, counts.get(x)+1);
	});
	return counts;
}

function reset(){
	$('.die').addClass('free');
	$('.die').addClass('waiting');
    $('.die').each(function(){
    	$(this).removeClass('d1 d2 d3 d4 d5 d6');
    });
	$('.scoreCell.free').addClass('waiting');
    $('.scoreCell.free').each(function(){
    	this.innerHTML='';
    })
    if (isGameOver()){
    	$('#roll').prop('disabled', true);
    	$('#roll').addClass('disabled');
    	endGame();
    } else {
	    $('#roll').removeClass('disabled');
	    $('#roll').prop('disabled',false);
	    rollsThatWereLeft = rollsSoFar;
	    rollsSoFar = 0;
    }
}

function isGameOver(){
	return $('.scoreCell.free').length==0;
}

function endGame(){
	$('#undo').css({"opacity":0});
	var finalScore = $('#totalTotal')[0].innerHTML - 0;
	var gameOverMessage = "Game over!  Final score: " + finalScore;
	if (highscores.length < NUMBER_OF_HIGH_SCORES_SAVED || highscores[NUMBER_OF_HIGH_SCORES_SAVED-1].score<finalScore){
		gameOverMessage+="\n\nNew high score!"
		var dateNow = new Date().toLocaleDateString('en-GB');
		var newHighScore = {'score':finalScore,'date':dateNow}
		if (highscores.length < NUMBER_OF_HIGH_SCORES_SAVED){
			highscores.push(newHighScore);
		} else {
			highscores[NUMBER_OF_HIGH_SCORES_SAVED-1] = newHighScore;
		}
		highscores.sort(function(a,b){
			return b.score - a.score;
		});
		setCookie("highscores", JSON.stringify(highscores), 10*365);
	}
	updateHighscoreDisplay()
	alert(gameOverMessage);
}

function updateHighscoreDisplay(){
	var headerRow="<tr><th>Rank</th><th>Score</th><th>Date</th></tr>\n";
	$('#highscores tbody').empty();
	$('#highscores tbody').append(headerRow+highscores.map(function(x, i){return "<tr><td>"+(i+1)+'</td><td>'+ x.score + '</td><td>' + x.date+'</td></tr>'}).join('\n'));
};

$('#roll').click(function() {
	if (rollsSoFar<3){
		$('#undo').css({"opacity":0});
		$('.scoreCell.free').removeClass('waiting');
	    $('.die').removeClass('waiting');
	    dice = Array.from($('.die:not(.free)').map(function(){
	    	for (var i=1; i<=6; i++){
		    	if ($(this).hasClass('d'+i)){
		    		return i;
		    	}
		    }
	    }));
	    $('.die.free').each(function() {
	    	$(this).removeClass('d1 d2 d3 d4 d5 d6');
	    	var dieValue = roll();
	        $(this).addClass("d"+dieValue);
	        dice.push(dieValue);
	    });
	    calculateScores(dice);
	    if (++rollsSoFar==3){
	    	$(this).prop('disabled', true);
	    	$(this).addClass('disabled');
	    	$('.die').removeClass('free');
			$('.die').addClass('waiting');
	    }
	}
});

$('.die').click(function() {
	if (!$(this).hasClass('waiting')){
	    if ($(this).hasClass('free')) {
	        $(this).removeClass('free');
	    } else {
	        $(this).addClass('free');
	    }
	}
});

$('.scoreCell.free').click(function(){
	if (rollsSoFar>0 && $(this).hasClass('free')){
		lastClicked = this;
		$(this).removeClass('free');
		var thisScore = this.innerHTML - 0;
		var column = Array.from(this.parentNode.children).indexOf(this); //note this is indexed from 1 to 3 given row header
		if (this.matches('.upperRow *')) {
			newScore = thisScore + ($('#upperTotals td:nth-child('+(column+1)+')')[0].innerHTML-0);
			$('#upperTotals td:nth-child('+(column+1)+')')[0].innerHTML = newScore;
			if (newScore >= 63){
				$('#bonus td:nth-child('+(column+1)+')')[0].innerHTML = 35;
				thisScore+=35;
			}
		}
		$('#totals td:nth-child('+(column+1)+')')[0].innerHTML = thisScore + ($('#totals td:nth-child('+(column+1)+')')[0].innerHTML-0);
		$('#totalTotal')[0].innerHTML = thisScore + ($('#totalTotal')[0].innerHTML-0);
		$('#undo').css({"opacity":1});
		reset();
	}
});

$('#undo').click(function(){
	$(this).css({"opacity":0});

	$(lastClicked).addClass('free');
	var thisScore = $(lastClicked)[0].innerHTML - 0;
	var column = Array.from(lastClicked.parentNode.children).indexOf(lastClicked); //note this is indexed from 1 to 3 given row header
	if (lastClicked.matches('.upperRow *')) {
		newScore = $('#upperTotals td:nth-child('+(column+1)+')')[0].innerHTML - thisScore;
		$('#upperTotals td:nth-child('+(column+1)+')')[0].innerHTML = newScore;
		if (newScore + thisScore >= 63 && newScore < 63){
			$('#bonus td:nth-child('+(column+1)+')')[0].innerHTML = 0;
			thisScore+=35;
		}
	}
	$('#totals td:nth-child('+(column+1)+')')[0].innerHTML = $('#totals td:nth-child('+(column+1)+')')[0].innerHTML - thisScore;
	$('#totalTotal')[0].innerHTML = $('#totalTotal')[0].innerHTML - thisScore;

	$('.scoreCell.free').removeClass('waiting');
    $('.die').removeClass('waiting');
    dice.forEach(function(value, i){
    	$('.die.free:nth-child('+(i+1)+')').addClass("d"+value);
    });
    calculateScores(dice);
    rollsSoFar = rollsThatWereLeft
    if (rollsSoFar==3){
    	$("#roll").prop('disabled', true);
    	$("#roll").addClass('disabled');
    	$('.die').removeClass('free');
		$('.die').addClass('waiting');
    }
});

$(function(){
	highscores = getCookie("highscores");
	if (highscores==""){
		highscores = [];
	} else {
		highscores = JSON.parse(highscores);
		updateHighscoreDisplay();
	}
})

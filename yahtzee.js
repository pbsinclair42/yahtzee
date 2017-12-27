var rollsSoFar = 0;
var rollsThatWereLeft = 0;
var dice = [];
var lastClicked;

Set.prototype.isSuperset = function(subset) {
    for (var elem of subset) {
        if (!this.has(elem)) {
            return false;
        }
    }
    return true;
}

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
	$('#undo').hide();
	alert("Game over!  Final score: " + $('#totalTotal')[0].innerHTML)
}

$('#roll').click(function() {
	if (rollsSoFar<3){
		$('#undo').hide();
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
		$('#undo').show();
		reset();
	}
});

$('#undo').click(function(){
	$(this).hide();

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

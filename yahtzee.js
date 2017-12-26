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

$('#roll').click(function() {
    $('.die.free').each(function() {
        this.innerHTML = roll();
    });
    var dice = [];
    $('.die').each(function(){
    	dice.push(this.innerHTML-0);
    })
    calculateScores(dice);
});


$('.die').click(function() {
    if ($(this).hasClass('free')) {
        $(this).removeClass('free');
    } else {
        $(this).addClass('free');
    }
})

$('.scoreCell.free').click(function(){
	if ($(this).hasClass('free')){
		$(this).removeClass('free');
		var thisScore = this.innerHTML - 0;
		if (this.matches('.upperRow *')) {
			$('#totalUpper')[0].innerHTML = thisScore + ($('#totalUpper')[0].innerHTML-0);
		} else {
			$('#totalLower')[0].innerHTML = thisScore + ($('#totalLower')[0].innerHTML-0);
		}
		$('#totalTotal')[0].innerHTML = thisScore + ($('#totalTotal')[0].innerHTML-0);
	}
})
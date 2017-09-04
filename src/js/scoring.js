let Scoring = () => {

	const DATASETS_311 = [
		'graffiti',
		'pot_holes',
		'rodent_baiting'
	];

	const WEIGHT = {
		absent: -1,
		contrarian: 10,
		win: 1,
		lose: -1,
		pass: 7,
		fail: -14,
		complete: 1,
		incomplete: -1
	};

	const TITLE = {
		absent: 'Absent',
		contrarian: 'Vote Against Mayor',
		win: 'Won Vote',
		lose: 'Lost Vote',
		pass: 'Passed Bill',
		fail: 'Failed Bill',
		complete: 'Complete 311',
		incomplete: 'Incomplete 311'
	};

	let getScoreBreakdown = (data) => {
		let breakdown = {
			absent: 0,
			contrarian: 0,
			win: 0,
			lose: 0,
			pass: 0,
			fail: 0,
			complete: 0,
			incomplete: 0
		};
		DATASETS_311.forEach((did) => {
			let complete = data[`complete_${did}`];
			let incomplete = data[`incomplete_${did}`];
			breakdown.complete += complete;
			breakdown.incomplete += incomplete;
		});
		breakdown.absent = data.votes_absent;
		breakdown.contrarian = data.votes_no_mayor;
		breakdown.win = data.votes_yes_pass + data.votes_no_fail
		breakdown.lose = data.votes_yes_fail + data.votes_no_pass
		breakdown.pass = data.sponsor_pass;
		breakdown.fail = data.sponsor_fail;
		return breakdown;	
	}

	let getScorePoints = (breakdown) => {
		let points = {};
		for (let bid in breakdown) {
			let count = breakdown[bid];
			points[bid] = count * WEIGHT[bid];
		}
		return points;
	}

	let getScore = (breakdown) => {
		let sum = 0;
		for (let bid in breakdown) {
			sum += breakdown[bid];
		}
		return sum;
	}

	return {
		DATASETS_311: DATASETS_311,
		WEIGHT: WEIGHT,
		TITLE: TITLE,
		getScoreBreakdown: getScoreBreakdown,
		getScorePoints: getScorePoints,
		getScore: getScore
	};

}

export {Scoring};
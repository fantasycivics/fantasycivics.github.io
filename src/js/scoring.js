let Scoring = () => {

	const DATASETS_311 = [
		'graffiti',
		//'pot_holes',
		'rodent_baiting'
	];

	const WEIGHT = {
		absent: -1,
		contrarian: 10,
		win: 1,
		lose: -1,
		pass: 7,
		fail: -14,
		complete_graffiti: 1,
		incomplete_graffiti: -1,
		complete_rodent_baiting: 1,
		incomplete_rodent_baiting: -1
	};

	const TITLE = {
		absent: 'Absent for Vote',
		contrarian: 'Vote Against a Mayor-sponsored Bill',
		win: 'Won Vote',
		lose: 'Lost Vote',
		pass: 'Passed Bill',
		fail: 'Failed Bill',
		complete_graffiti: 'Complete Graffiti Abatement',
		incomplete_graffiti: 'Incomplete Graffiti Abatement',
		complete_rodent_baiting: 'Complete Rodent Baiting',
		incomplete_rodent_baiting: 'Incomplete Rodent Baiting'
	};

	const POSITION_SCORE = {
		captain: ['absent', 'contrarian', 'win', 'lose', 'pass', 'fail', 'complete_graffiti', 'incomplete_graffiti', 'complete_rodent_baiting', 'incomplete_rodent_baiting'],
		council1: ['absent', 'contrarian', 'win', 'lose', 'pass', 'fail'],
		council2: ['absent', 'contrarian', 'win', 'lose', 'pass', 'fail'],
		graffiti: ['complete_graffiti', 'incomplete_graffiti'],
		rodents: ['complete_rodent_baiting', 'incomplete_rodent_baiting']
	};

	let getScoreBreakdown = (data) => {
		let breakdown = {
			absent: 0,
			contrarian: 0,
			win: 0,
			lose: 0,
			pass: 0,
			fail: 0,
			complete_graffiti: 0,
			incomplete_graffiti: 0,
			complete_rodent_baiting: 0,
			incomplete_rodent_baiting: 0
		};
		DATASETS_311.forEach((did) => {
			let complete = data[`complete_${did}`] || 0;
			let incomplete = data[`incomplete_${did}`] || 0;
			breakdown[`complete_${did}`] += complete;
			breakdown[`incomplete_${did}`] += incomplete;
		});
		breakdown.absent = data.votes_absent || 0;
		breakdown.contrarian = data.votes_no_mayor || 0;
		breakdown.win = (data.votes_yes_pass || 0) + (data.votes_no_fail || 0);
		breakdown.lose = (data.votes_yes_fail || 0) + (data.votes_no_pass || 0);
		breakdown.pass = data.sponsor_pass || 0;
		breakdown.fail = data.sponsor_fail || 0;
		return breakdown;	
	}

	let getScorePoints = (breakdown, position) => {
		let fields = POSITION_SCORE[position] || [];
		let points = {};
		for (let bid in breakdown) {
			let count = breakdown[bid];
			let includeField = (fields.indexOf(bid) > -1) || (!position);
			if (includeField) {
				points[bid] = count * WEIGHT[bid];
			}
		}
		return points;
	}

	let getScore = (points) => {
		let sum = 0;
		for (let bid in points) {
			sum += points[bid];
		}
		return sum;
	}

	return {
		DATASETS_311: DATASETS_311,
		WEIGHT: WEIGHT,
		TITLE: TITLE,
		POSITION_SCORE: POSITION_SCORE,
		getScoreBreakdown: getScoreBreakdown,
		getScorePoints: getScorePoints,
		getScore: getScore
	};

}

export {Scoring};
const API_URL = `http://ocd.datamade.us/`;
const MAYOR_OCD = 'ocd-person/f649753d-081d-4f22-8dcf-3af71de0e6ca';

let config = {
	apiKey: "AIzaSyDusGUpsFfhJmRnmB2cgfetwR3ZR2otqe4",
	authDomain: "fantasycivics.firebaseapp.com",
	databaseURL: "https://fantasycivics.firebaseio.com",
	storageBucket: "fantasycivics.appspot.com",
	messagingSenderId: "245596715039"
};
let DatabaseFirebase = firebase.initializeApp(config, 'Fantasy Civics Scraper');
let db = DatabaseFirebase.database();

const TIME_RANGE = [
	new Date('7/1/2017').getTime(),
	new Date('8/1/2017').getTime()	
];

clean311Data();

db.ref('july_test').once('value', (snap) => {

	let val = snap.val();

	//cleanCityCouncilData(val);

});

function cleanCityCouncilData(val) {
	let voteList = Object.keys(val).map((key) => {
		let value = val[key];
			value.key = key;
		return value;
	}).sort((a, b) => {
		return a.timestamp - b.timestamp;
	});

	let types = {};
	let voteTypes = [];
	let resultTypes = [];
	let entry_timestamp = false;
	voteList.forEach((vote) => {

		entry_timestamp = vote.timestamp;

		if (!(vote.type in types)) {
			types[vote.type] = {
				count: 0,
				example: false
			};
		}
		types[vote.type].count++;
		types[vote.type].example = vote;

		if (vote.type === 'vote') {
			let hasVoteType = voteTypes.indexOf(vote.option) > -1;
			if (!hasVoteType) {
				voteTypes.push(vote.option);
			}
		}
		let hasResultType = resultTypes.indexOf(vote.result) > -1;
		if (!hasResultType) {
			resultTypes.push(vote.result);
		}

	});
	console.log(types);
	console.log(voteTypes);
	console.log(resultTypes);

	let aldMap = {};
	voteList.forEach((vote) => {
		let ald_id = vote.ocd_person;
		if (!(ald_id in aldMap)) {
			aldMap[ald_id] = {
				ocd_person: ald_id,
				timestamp: entry_timestamp,
				votes_absent: 0,
				votes_yes_pass: 0,
				votes_no_pass: 0,
				votes_yes_fail: 0,
				votes_no_fail: 0,
				votes_yes_mayor: 0,
				votes_no_mayor: 0,
				sponsor_pass: 0,
				sponsor_fail: 0
			};
		}
		if (vote.type === 'vote') {
			if (vote.option === 'absent') {
				aldMap[ald_id].votes_absent++;
			}
			if (vote.option === 'yes') {
				if (vote.result === 'pass') {
					aldMap[ald_id].votes_yes_pass++;
				} else if (vote.result === 'fail') {
					aldMap[ald_id].votes_yes_fail++;
				}
				if (vote.mayor_sponsored) {
					aldMap[ald_id].votes_yes_mayor++;
				}
			} else if (vote.option === 'no') {
				if (vote.result === 'pass') {
					aldMap[ald_id].votes_no_pass++;
				} else if (vote.result === 'fail') {
					aldMap[ald_id].votes_no_fail++;
				}
				if (vote.mayor_sponsored) {
					aldMap[ald_id].votes_no_mayor++;
				}
			}
		}
		else if (vote.type === 'sponsorship') {
			if (vote.result === 'pass') {
				aldMap[ald_id].sponsor_pass++;
			} else {
				aldMap[ald_id].sponsor_fail++;
			}
		}
	});
	console.log(aldMap);
	let ald_num = 1;
	for (let ald_id in aldMap) {
		let counts = '';
		for (let key in aldMap[ald_id]) {
			counts += `${key}: ${aldMap[ald_id][key]}, `;
		}
		//console.log(`${ald_num}: ${counts}`);
		ald_num++;
	}
}

function 

function clean311Data() {

	let fetch311 = Fetch311();
	fetch311.getFromDataset({
		player: 'playerid0001',
		dataset: 'graffiti',
		from: TIME_RANGE[0],
		to: TIME_RANGE[1]
	}).then((res) => {

		res.forEach((entry) => {
			if (entry.completion_date) {
				let completedOn = new Date(entry.completion_date).getTime();
				let completedOnTime = completedOn < TIME_RANGE[1];
				if (completedOnTime) {
					//
				} else {
					//
				}
			}
		});

	}).catch(console.error);

}
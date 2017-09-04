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
	new Date('8/1/2017').getTime(),
	new Date('9/1/2017').getTime()	
];

const DATASETS_311 = [
	'graffiti',
	'pot_holes',
	'rodent_baiting'
];

cleanAllData().then((aldMap) => {
	let promises = [];
	let entries = [];
	let midPointTimestamp = Math.round((0.5) * (TIME_RANGE[1] + TIME_RANGE[0]));
	for (let pid in aldMap) {
		let entry = aldMap[pid];
			entry.playerid = pid;
			entry.timestamp = midPointTimestamp;
		entries.push(entries);
		/*let p = db.ref(`player_scores`).push(entry);
		promises.push(p);*/
	}
	console.log(`Prepared ${entries.length} records.`);
	Promise.all(promises).then((done) => {
		console.log(`Saved ${done.length} records to Firebase.`);
	}).catch(console.error);
}).catch(console.error);

function cleanAllData() {
	return new Promise((resolveAll, rejectAll) => {
		let dataSourcePromises = [];
		let p1 = clean311Data();
			p1.source = '311';
			dataSourcePromises.push(p1);
		let p2 = cleanCityCouncilData();
			p2.source = 'city_council';
			dataSourcePromises.push(p2);
		Promise.all(dataSourcePromises).then((resList) => {
			let dataMap311 = {};
			let dataMapCC = {};
			resList.forEach((dataMap, didx) => {
				switch (dataSourcePromises[didx].source) {
					case '311':
						dataMap311 = dataMap;
						break;
					case 'city_council':
						dataMapCC = dataMap;
						break;
				}
			});
			let aldMap = {};
			for (let pid in PLAYER_MAP) {
				let entry = {
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
				DATASETS_311.forEach((did) => {
					entry[`complete_${did}`] = 0;
					entry[`incomplete_${did}`] = 0;
				});
				let data311 = dataMap311[pid];
				for (let key in data311) {
					entry[key] = data311[key];
				}
				let ocd_person = PLAYER_MAP[pid].ocd_person;
				let dataCC = dataMapCC[ocd_person];
				for (let key in dataCC) {
					entry[key] = dataCC[key];
				}
				aldMap[pid] = entry;
			}
			//console.log(aldMap);
			resolveAll(aldMap);
		}).catch(rejectAll);
	});
}

function cleanCityCouncilData(val) {
	return new Promise((resolve, reject) => {
		db.ref('july_test').once('value', (snap) => {

			let val = snap.val();

			let voteList = Object.keys(val).map((key) => {
				let value = val[key];
					value.key = key;
				return value;
			}).sort((a, b) => {
				return a.timestamp - b.timestamp;
			}).filter((vote) => {
				let isInRange = (vote.timestamp > TIME_RANGE[0]) && (vote.timestamp < TIME_RANGE[1]);
				return isInRange;
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
			//console.log(aldMap);
			let ald_num = 1;
			for (let ald_id in aldMap) {
				let counts = '';
				for (let key in aldMap[ald_id]) {
					counts += `${key}: ${aldMap[ald_id][key]}, `;
				}
				//console.log(`${ald_num}: ${counts}`);
				ald_num++;
			}
			resolve(aldMap);

		});
	});
}

function clean311Data() {
	let fetch311 = Fetch311();
	return new Promise((resolve, reject) => {
		let promises = [];
		for (let pid in PLAYER_MAP) {
			DATASETS_311.forEach((did) => {
				let p = fetch311.getFromDataset({
					player: pid,
					dataset: did,
					from: TIME_RANGE[0],
					to: TIME_RANGE[1]
				});
				p.pid = pid;
				p.did = did;
				promises.push(p);
			});
		}

		let aldMap = {};
		Promise.all(promises).then((resList) => {
			resList.forEach((res, ridx) => {
				let meta = promises[ridx];
				let pid = meta.pid;
				let did = meta.did;
				if (!(pid in aldMap)) {
					aldMap[pid] = {};
				}
				if (!(did in aldMap[pid])) {
					aldMap[pid][`complete_${did}`] = 0;
					aldMap[pid][`incomplete_${did}`] = 0;
				}
				res.forEach((entry) => {
					if (entry.completion_date) {
						let completedOn = new Date(entry.completion_date).getTime();
						let completedOnTime = completedOn < TIME_RANGE[1];
						if (completedOnTime) {
							aldMap[pid][`complete_${did}`]++;
						} else {
							aldMap[pid][`incomplete_${did}`]++;
						}
					}
				});
			});
			//console.log(aldMap);
			resolve(aldMap);
		}).catch(console.error);
	});
}
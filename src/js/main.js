import {Views} from './views';
import {Scoring} from './scoring';
import {Fetch311} from './311';

let config = {
	apiKey: "AIzaSyDusGUpsFfhJmRnmB2cgfetwR3ZR2otqe4",
	authDomain: "fantasycivics.firebaseapp.com",
	databaseURL: "https://fantasycivics.firebaseio.com",
	storageBucket: "fantasycivics.appspot.com",
	messagingSenderId: "245596715039"
};
let DatabaseFirebase = firebase.initializeApp(config, 'Fantasy Civics Game');
let db = DatabaseFirebase.database();

let views = Views();
let scorer = Scoring();
let fetch311 = Fetch311();

let PARAMS = getQueryParams(document.location.search);
if (PARAMS.tab) {
	showSection(PARAMS.tab);	
}
let ts = new Date('8/1/2017').getTime(); //Date.now();
if (PARAMS.date) {
	let dateParts = PARAMS.date.split('-');
	ts = new Date(dateParts[1], parseInt(dateParts[0]) - 1).getTime();
}

let now = new Date(ts);
let lastMonth = now.getUTCMonth() - 1;
let dStart = new Date(now.getUTCFullYear(), lastMonth).getTime();
let dEnd = new Date(now.getUTCFullYear(), now.getUTCMonth()).getTime();
let dProj = new Date(now.getUTCFullYear(), now.getUTCMonth() + 1).getTime();

const TIME_RANGE = [dStart, dEnd];
const PROJECTION_RANGE = [dEnd, dProj];

console.log(TIME_RANGE)
console.log(PROJECTION_RANGE)

const ROSTER_ORDER = ['captain', 'council1', 'council2', 'graffiti', 'rodents'];
const POSITION_DETAILS = {
	captain: {
		title: 'Captain',
		code: 'CAPT',
		description: 'Earns points for all Alder-ly activities.'
	},
	council1: {
		title: 'Councilperson',
		code: 'COUN',
		description: 'Earns points for activity in City Council meetings.'
	},
	council2: {
		title: 'Councilperson',
		code: 'COUN',
		description: 'Earns points for activity in City Council meetings.'
	},
	graffiti: {
		title: 'Graffiti Buster',
		code: 'GRAF',
		description: 'Earns points for fulfilling graffiti abatement 311 requests.'
	},
	rodents: {
		title: 'Rodent Warrior',
		code: 'RDNT',
		description: 'Earns points for fulfilling rodent baiting 311 requests.'
	}
};

let tabs = Array.from(document.querySelector('#tabs-main').children);
tabs.forEach((tab) => {
	tab.addEventListener('click', (e) => {
		let tabName = tab.dataset.tab;
		showSection(tabName);
	});
});

const ALPHABET = ('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz').split('');

document.querySelector('#share-roster').addEventListener('click', (e) => {
	let roster = getMyRoster();
	let hash = getHashFromRoster(roster);
	let shareView = views.getShareView({
		hash: hash
	});
	let shareVex = vex.dialog.alert({
		unsafeMessage: shareView.innerHTML,
		buttons: []
	});
	let copyLink = `https://fantasycivics.github.io/game/?roster=${hash}`;
	let copyTarget = shareVex.contentEl.querySelector('[data-clipboard-text]');
	let clipboard = new Clipboard(copyTarget);
	clipboard.on('success', (e) => {
		shareVex.close();
		vex.dialog.alert('Copied roster link!');
	});
	clipboard.on('error', (e) => {
		shareVex.close();
		vex.dialog.prompt({
			message: `Copy your link below:`,
			value: copyLink,
			callback: () => {}
		});
	});
});

getPlayerNodes(TIME_RANGE).then((nodes) => {
	getPlayerProjections(PROJECTION_RANGE).then((projMap) => {
		main(nodes, projMap);
	});
}).catch(console.error);

function main(nodes, projMap) {
	let playerNodes = Object.keys(nodes).map((key) => {
		let val = nodes[key];
			val.key = key;
		return val;
	});

	let aldMap = {};
	playerNodes.forEach((data) => {
		let pid = data.playerid;
		aldMap[pid] = data;
	});

	console.log(aldMap);
	console.log(projMap);

	if (PARAMS.roster) {
		let roster = getRosterFromHash(PARAMS.roster);
		setMyRoster(roster);
	}

	showSection('roster');
	renderRoster(getMyRoster(), aldMap, projMap);

	let rows = playerNodes.sort((a, b) => {
		return 0;
	}).map((data) => {
		let player = PLAYER_MAP[data.playerid];
		let breakdown = scorer.getScoreBreakdown(data);
		let points = scorer.getScorePoints(breakdown);
		let score = scorer.getScore(points);
		let proj = projMap[data.playerid] || {};
		let projBreakDown = scorer.getScoreBreakdown(proj);
		let projPoints = scorer.getScorePoints(projBreakDown);
		let projScore = scorer.getScore(projPoints);
		return {
			playerid: data.playerid,
			name: player.name,
			ward: player.ward,
			projected: projScore,
			lastMonth: score
		};
	});

	let table = views.getAldersTable({
		rows: rows
	});
	let out = document.querySelector('#alders-table');
	out.innerHTML = '';
	out.appendChild(table);
	Sortable.initTable(table);
	let buttons = Array.from(table.querySelectorAll('button[data-playerid]'));
	buttons.forEach((button) => {
		button.addEventListener('click', (e) => {
			let playerid = button.dataset.playerid;
			let player = PLAYER_MAP[playerid];
			let freeAgent = isFreeAgent(getMyRoster(), playerid);
			let data = aldMap[playerid] || {};
			let breakdown = scorer.getScoreBreakdown(data);
			let points = scorer.getScorePoints(breakdown);
			let score = scorer.getScore(points);
			let month = moment(data.timestamp).format('MMMM YYYY');
			let alderView = views.getAlderView({
				month: month,
				title: `Scouting Report`,
				playerid: playerid,
				profile: player,
				breakdown: breakdown,
				points: points,
				score: score,
				titles: scorer.TITLE,
				isFreeAgent: freeAgent
			});
			let buttonList = [];
			if (freeAgent) {
				buttonList.push({
					type: 'button',
					text: 'Add To Roster',
					className: 'vex-dialog-button-primary',
					click: (e) => {
						let copyRoster = getMyRoster();
						addPlayerToRoster(copyRoster, playerid, aldMap, projMap).then((newRoster) => {
							if (newRoster) {
								let showRoster = setMyRoster(newRoster);
								renderRoster(showRoster, aldMap, projMap);
								showSection('roster');
							}
						}).catch(console.error);
						alderVex.close();
					}
				});
			}
			buttonList.push({
				type: 'button',
				text: 'Cancel',
				className: 'vex-dialog-button-secondary',
				click: (e) => {
					alderVex.close();
				}
			});
			let alderVex = vex.dialog.alert({
				unsafeMessage: alderView.innerHTML,
				buttons: buttonList
			});
		});
	});
}

function getRosterRows(roster, aldMap, projMap) {
	return ROSTER_ORDER.map((pos) => {
		let pid = roster[pos];
		if (pid) {
			let player = PLAYER_MAP[pid];
			let data = aldMap[pid] || {};
			let breakdown = scorer.getScoreBreakdown(data);
			let points = scorer.getScorePoints(breakdown, pos);
			let score = scorer.getScore(points);
			let proj = projMap[pid] || {};
			let projBreakDown = scorer.getScoreBreakdown(proj);
			let projPoints = scorer.getScorePoints(projBreakDown);
			let projScore = scorer.getScore(projPoints);
			return {
				playerid: pid,
				position: pos,
				code: POSITION_DETAILS[pos].code,
				name: player.name,
				ward: player.ward,
				projected: projScore,
				lastMonth: score
			};
		} else {
			return {
				playerid: false,
				position: pos,
				code: POSITION_DETAILS[pos].code,
				name: '---',
				ward: '---',
				projected: 0,
				lastMonth: 0
			};
		}
	});
}

function renderRoster(roster, aldMap, projMap) {
	let rows = getRosterRows(roster, aldMap, projMap);
	let projected = rows.reduce((sum, row) => {
		return sum + row.projected;
	}, 0);
	let total = rows.reduce((sum, row) => {
		return sum + row.lastMonth;
	}, 0);
	let table = views.getRosterTable({
		rows: rows,
		lastMonth: moment(TIME_RANGE[0]).format('MMMM YYYY'),
		projected: projected,
		total: total
	});
	let out = document.querySelector('#roster-table');
		out.innerHTML = '';
		out.appendChild(table);
	let buttons = Array.from(table.querySelectorAll('button[data-playerid]'));
	buttons.forEach((button) => {
		button.addEventListener('click', (e) => {
			let playerid = button.dataset.playerid;
			let position = button.dataset.position;
			let action = button.dataset.action;
			switch (action) {
				case 'fill':
					showSection('players');
					break;
				case 'drop':
					roster[position] = false;
					let newRoster = setMyRoster(roster);
					renderRoster(newRoster, aldMap, projMap);
					break;
				case 'view':
					let player = PLAYER_MAP[playerid];
					let data = aldMap[playerid] || {};
					let breakdown = scorer.getScoreBreakdown(data);
					let points = scorer.getScorePoints(breakdown, position);
					let score = scorer.getScore(points);
					let playerTitle = POSITION_DETAILS[position].title;
					let month = moment(data.timestamp).format('MMMM YYYY');
					let alderView = views.getAlderView({
						month: month,
						title: playerTitle,
						playerid: playerid,
						profile: player,
						breakdown: breakdown,
						points: points,
						score: score,
						titles: scorer.TITLE,
						isFreeAgent: isFreeAgent(getMyRoster(), playerid)
					});
					let alderVex = vex.dialog.alert({
						unsafeMessage: alderView.innerHTML,
						buttons: [
							{
								type: 'button',
								text: 'View All Points',
								className: 'vex-dialog-button-primary',
								click: (e) => {
									let fullPoints = scorer.getScorePoints(breakdown);
									let fullScore = scorer.getScore(fullPoints);
									let month = moment(data.timestamp).format('MMMM YYYY');
									let fullView = views.getAlderView({
										month: month,
										title: `Scouting Report`,
										playerid: playerid,
										profile: player,
										breakdown: breakdown,
										points: fullPoints,
										score: fullScore,
										titles: scorer.TITLE,
										isFreeAgent: isFreeAgent(getMyRoster(), playerid)
									});
									let fullVex = vex.dialog.alert({
										unsafeMessage: fullView.innerHTML,
										buttons: [{
											type: 'button',
											text: 'Close',
											className: 'vex-dialog-button-secondary',
											click: (e) => {
												fullVex.close();
											}
										}]
									});
									alderVex.close();
								}
							},
							{
								type: 'button',
								text: 'Close',
								className: 'vex-dialog-button-secondary',
								click: (e) => {
									alderVex.close();
								}
							}
						]
					});
					break;
			}
		});
	});
	let helpers = Array.from(table.querySelectorAll('[data-positionkey]'));
	helpers.forEach((helper) => {
		helper.addEventListener('click', (e) => {
			let position = helper.dataset.positionkey;
			let details = POSITION_DETAILS[position];
			let fields = scorer.POSITION_SCORE[position];
			let weights = scorer.WEIGHT;
			let titles = scorer.TITLE;
			let explainView = views.getPositionExplanation({
				position: position,
				details: details,
				fields: fields,
				weights: weights,
				titles: titles
			});
			vex.dialog.alert({
				unsafeMessage: explainView
			});
		});
	});

}

function addPlayerToRoster(oldRoster, playerid, aldMap, projMap) {
	return new Promise((resolve, reject) => {
		let addView = views.getAddPlayerView({
			rows: getRosterRows(oldRoster, aldMap, projMap)
		});
		let addVex = vex.dialog.alert({
			unsafeMessage: addView.innerHTML,
			buttons: [
				{
					type: 'button',
					text: 'Cancel',
					className: 'vex-dialog-button-secondary',
					click: (e) => {
						resolve(false);
						addVex.close();
					}
				}
			],
			callback: (value) => {
				resolve(false);
			}
		});
		let buttons = Array.from(addVex.contentEl.querySelectorAll('button[data-position]'));
		buttons.forEach((button) => {
			button.addEventListener('click', (e) => {
				e.preventDefault();
				let position = button.dataset.position;
				oldRoster[position] = playerid;
				resolve(oldRoster);
				addVex.close();
			});
		});
	});
}

function isFreeAgent(roster, playerid) {
	let onRoster = false;
	for (let pos in roster) {
		let pid = roster[pos];
		if (pid === playerid) {
			onRoster = true;
		}
	}
	return !onRoster;
}

function getMyRoster() {
	let roster = {};
	ROSTER_ORDER.forEach((pos) => {
		roster[pos] = localStorage.getItem(`fc_roster_${pos}`) || false;
		if (!(roster[pos] in PLAYER_MAP)) {
			roster[pos] = false;
		}
	});
	return roster;
}

function setMyRoster(newRoster) {
	for (let pos in newRoster) {
		let pid = newRoster[pos] || false;
		localStorage.setItem(`fc_roster_${pos}`, pid);
	}
	return getMyRoster();
}

function getHashFromRoster(roster) {
	return ROSTER_ORDER.reduce((str, pos) => {
		let pid = roster[pos];
		let alpha = '_';
		if (pid in PLAYER_MAP) {
			let ward = PLAYER_MAP[pid].ward;
			alpha = ALPHABET[ward];
		}
		return str + alpha;
	}, '');
}

function getRosterFromHash(hash) {
	let wardsToPlayers = {};
	for (let pid in PLAYER_MAP) {
		let profile = PLAYER_MAP[pid];
		wardsToPlayers[profile.ward] = pid;
	}
	let hashParts = hash.split('');
	return ROSTER_ORDER.reduce((roster, position, hidx) => {
		let alpha = hashParts[hidx];
		let ward = ALPHABET.indexOf(alpha);
		if (ward > -1) {
			roster[position] = wardsToPlayers[ward];
		} else {
			roster[position] = false;
		}
		return roster;
	}, {});
}

function showSection(sectionName) {
	let sections = Array.from(document.querySelectorAll('.section.is-single'));
	sections.forEach((section) => {
		if (!section.classList.contains('is-hidden')) {
			section.classList.add('is-hidden');
		}
	});
	document.querySelector(`[data-section="${sectionName}"]`).classList.remove('is-hidden');
	let tabs = Array.from(document.querySelector('#tabs-main').children);
	tabs.forEach((tab) => {
		if (tab.classList.contains('is-active')) {
			tab.classList.remove('is-active');
		}
	});
	document.querySelector(`[data-tab="${sectionName}"]`).classList.add('is-active');
}

function getPlayerNodes(timeRange) {
	return new Promise((resolve, reject) => {
		try {
			let ref = db.ref(`player_scores`);
			let query = ref.orderByChild('timestamp').startAt(timeRange[0]).endAt(timeRange[1]);
			query.once('value', (snap) => {
				let nodes = snap.val() || {};
				resolve(nodes);
			});
		} catch (err) {
			reject(err);
		}
	});
}

function getPlayerProjections(timeRange) {
	return new Promise((resolve, reject) => {
		let promises = [];
		for (let pid in PLAYER_MAP) {
			scorer.DATASETS_311.forEach((did) => {
				let p = fetch311.getFromDataset({
					player: pid,
					dataset: did,
					from: timeRange[0],
					to: timeRange[1]
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
						let completedOnTime = completedOn < timeRange[1];
						if (completedOnTime) {
							aldMap[pid][`complete_${did}`]++;
						} else {
							aldMap[pid][`incomplete_${did}`]++;
						}
					} else {
						aldMap[pid][`incomplete_${did}`]++;
					}
				});
			});
			resolve(aldMap);
		}).catch(reject);
	});
}

function copyObject(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function getQueryParams(qs) {
	qs = qs.split('+').join(' ');
	var params = {},
		tokens,
		re = /[?&]?([^=]+)=([^&]*)/g;
	while (tokens = re.exec(qs)) {
		params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
	}
	return params;
}
import {Views} from './views';
import {Scoring} from './scoring';

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

let now = new Date('8/1/2017');
let lastMonth = now.getUTCMonth() - 1;
let dStart = new Date(now.getUTCFullYear(), lastMonth).getTime();
let dEnd = new Date(now.getUTCFullYear(), now.getUTCMonth()).getTime();

const TIME_RANGE = [dStart, dEnd];

console.log(TIME_RANGE)

let PARAMS = getQueryParams(document.location.search);
if (PARAMS.tab) {
	showSection(PARAMS.tab);	
}

let myRoster = {
	captain: false,
	council1: false,
	council2: false,
	graffiti: false,
	rodents: false
};

let tabs = Array.from(document.querySelector('#tabs-main').children);
	tabs.forEach((tab) => {
		tab.addEventListener('click', (e) => {
			let tabName = tab.dataset.tab;
			showSection(tabName);
		});
	});

let ref = db.ref(`player_scores`);
let query = ref.orderByChild('timestamp').startAt(TIME_RANGE[0]).endAt(TIME_RANGE[1]);
query.once('value', (snap) => {

	let nodes = snap.val() || {};

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

	showSection('roster');
	renderRoster(myRoster, aldMap);

	let rows = playerNodes.sort((a, b) => {
		return 0;
	}).map((data) => {
		let player = PLAYER_MAP[data.playerid];
		let breakdown = scorer.getScoreBreakdown(data);
		let points = scorer.getScorePoints(breakdown);
		let score = scorer.getScore(points);
		return {
			playerid: data.playerid,
			name: player.name,
			ward: player.ward,
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
			let freeAgent = isFreeAgent(myRoster, playerid);
			let data = aldMap[playerid];
			let breakdown = scorer.getScoreBreakdown(data);
			let points = scorer.getScorePoints(breakdown);
			let score = scorer.getScore(points);
			let alderView = views.getAlderView({
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
						let copyRoster = copyObject(myRoster);
						addPlayerToRoster(copyRoster, playerid, aldMap).then((newRoster) => {
							if (newRoster) {
								myRoster = newRoster;
								renderRoster(myRoster, aldMap);
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

	renderRoster(myRoster, aldMap);

});

const ROSTER_ORDER = ['captain', 'council1', 'council2', 'graffiti', 'rodents'];
const POSITION_CODE = {
	captain: 'CPTN',
	council1: 'CNCL',
	council2: 'CNCL',
	graffiti: 'GRAF',
	rodents: 'RDNT'
};

function getRosterRows(roster, aldMap) {
	return ROSTER_ORDER.map((pos) => {
		let pid = roster[pos];
		if (pid) {
			let player = PLAYER_MAP[pid];
			let data = aldMap[pid];
			let breakdown = scorer.getScoreBreakdown(data);
			let points = scorer.getScorePoints(breakdown, pos);
			let score = scorer.getScore(points);
			return {
				playerid: pid,
				position: pos,
				code: POSITION_CODE[pos],
				name: player.name,
				ward: player.ward,
				lastMonth: score
			};
		} else {
			return {
				playerid: false,
				position: pos,
				code: POSITION_CODE[pos],
				name: '---',
				ward: '---',
				lastMonth: 0
			};
		}
	});
}

function renderRoster(roster, aldMap) {
	let rows = getRosterRows(roster, aldMap);
	let total = rows.reduce((sum, row) => {
		return sum + row.lastMonth;
	}, 0);
	let table = views.getRosterTable({
		rows: rows,
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
					myRoster = roster;
					renderRoster(myRoster);
					break;
				case 'view':
					let player = PLAYER_MAP[playerid];
					let data = aldMap[playerid];
					let breakdown = scorer.getScoreBreakdown(data);
					let points = scorer.getScorePoints(breakdown, position);
					let score = scorer.getScore(points);
					let alderView = views.getAlderView({
						playerid: playerid,
						profile: player,
						breakdown: breakdown,
						points: points,
						score: score,
						titles: scorer.TITLE,
						isFreeAgent: isFreeAgent(myRoster, playerid)
					});
					let alderVex = vex.dialog.alert({
						unsafeMessage: alderView.innerHTML,
						buttons: [
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

}

function addPlayerToRoster(oldRoster, playerid, aldMap) {
	return new Promise((resolve, reject) => {
		let addView = views.getAddPlayerView({
			rows: getRosterRows(oldRoster, aldMap)
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
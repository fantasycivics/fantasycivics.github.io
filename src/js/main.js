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
				titles: scorer.TITLE
			});
			let alderVex = vex.dialog.alert({
				unsafeMessage: alderView.innerHTML,
				buttons: [
					{
						type: 'button',
						text: 'Add To Roster',
						className: 'vex-dialog-button-primary',
						click: (e) => {
							console.log(e);
						}
					},
					{
						type: 'button',
						text: 'Cancel',
						className: 'vex-dialog-button-secondary',
						click: (e) => {
							alderVex.close();
						}
					}
				]
			});
		});
	});

});
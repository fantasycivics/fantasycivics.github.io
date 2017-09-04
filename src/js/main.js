let config = {
	apiKey: "AIzaSyDusGUpsFfhJmRnmB2cgfetwR3ZR2otqe4",
	authDomain: "fantasycivics.firebaseapp.com",
	databaseURL: "https://fantasycivics.firebaseio.com",
	storageBucket: "fantasycivics.appspot.com",
	messagingSenderId: "245596715039"
};
let DatabaseFirebase = firebase.initializeApp(config, 'Fantasy Civics Game');
let db = DatabaseFirebase.database();

console.log(config);

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

	console.log(nodes)

	Object.keys(nodes).map((key) => {
		let val = nodes[key];
			val.key = key;
		return val;
	});

});
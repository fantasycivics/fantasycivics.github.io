const firebase = require('firebase');
const request = require('request');
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

let saveOutput = (endpoint, list) => {
	let promises = [];
	let ref = db.ref(endpoint);
	list.forEach(node => {
		let p = ref.push(node);
		promises.push(p);
	});
	return Promise.all(promises);
}

let sampleRequest = () => {
	request(`http://ocd.datamade.us/ocd-vote/2d11abcd-66e6-4c31-96ee-fa0d4f361ca2`, (error, response, body) => {
		if (error) {
			console.error(`ERROR: ${error}`);
		} else {
			let res = JSON.parse(body);
			for (key in res) {
				console.log(`${key}: ${typeof res[key]}`);
			}
		}
	});
}

console.logSoftly = (res) => {
	for (key in res) {
		console.log(`${key}: ${typeof res[key]}`);
	}
}

let getOCD = (queryStr) => {
	return new Promise((resolve, reject) => {
		request(`${API_URL}${queryStr}`, (error, response, body) => {
			if (error) {
				reject(error);
			} else {
				let res = JSON.parse(body);
				resolve(res);
			}
		});
	});
}

let getOCDFull = (queryStr, queryPage, fullReply) => {
	let page = queryPage || 1;
	let list = fullReply || [];
	let fullQuery = queryStr + '&page=' + page;
	return new Promise((resolve, reject) => {
		request(`${API_URL}${fullQuery}`, (error, response, body) => {
			if (error) {
				reject(error);
			} else {
				let res = JSON.parse(body);
				list.push.apply(list, res.results);
				console.log(res.meta.page + '/' + res.meta.max_page)
				if(res.meta.page === res.meta.max_page){
					resolve(list);
				}
				else{
					let nextPage = res.meta.page + 1;
					getOCDFull(queryStr, nextPage, list).then(resolve).catch(reject);
				}
			}
		});
	});
}

let getVoteDetails = (vote) => {
	let promises = [
		getOCD(vote.id),
		getOCD(vote.bill.id)
	];
	return new Promise((resolve, reject) => {
		Promise.all(promises).then(details => {
			resolve({
				vote: details[0],
				bill: details[1]
			});
		}).catch(reject);
	});
}

let getVoteTimestamp = (vote) => {
	return new Date(vote.start_date + ' CST').getTime();
}

let sponsoredByMayor = (bill) => {
	return bill.sponsorships.map(s => s.entity_id).indexOf(MAYOR_OCD) > -1;
}

let voteURL = 'votes?organization__id=ocd-organization/ef168607-9135-4177-ad8e-c1f7a4806c3a'
	voteURL += '&start_date__contains=2017-07'
	voteURL += '&sort=start_date'

let startOnPage = 5; // Total: 6 pages for July 2017 records

getOCDFull(voteURL, startOnPage).then(res => {

	let output = [];

	let vote1 = res[0];
	let voteN = res[res.length-1];
	let d1 = new Date(getVoteTimestamp(vote1));
	let dN = new Date(getVoteTimestamp(voteN));
	console.log(`Counted ${res.length} votes.`);
	console.log(d1);
	console.log(dN);

	let promises = [];
	res.forEach(voteRecord => {
		let vp = getVoteDetails(voteRecord);
		promises.push(vp);
	});
	Promise.all(promises).then(votes => {

		//let aldMap = {};

		votes.forEach(voteData => {
			let vote = voteData.vote;
			let bill = voteData.bill;
			bill.sponsorships.forEach(sponsor => {
				output.push({
					type: 'sponsorship',
					timestamp: getVoteTimestamp(vote),
					ocd_person: sponsor.entity_id,
					ocd_bill: bill.id,
					mayor_sponsored: sponsoredByMayor(bill),
					identifier: bill.identifier[0],
					result: vote.result,
					classification: sponsor.classification
				});
			});
			vote.votes.forEach(voteCast => {
				output.push({
					type: 'vote',
					timestamp: getVoteTimestamp(vote),
					ocd_person: voteCast.voter.id,
					ocd_bill: bill.id,
					mayor_sponsored: sponsoredByMayor(bill),
					identifier: bill.identifier[0],
					result: vote.result,
					option: voteCast.option
				});
				//aldMap[voteCast.voter.id] = voteCast.voter_name
			});
		});

		//console.logSoftly(output);
		//console.log(aldMap)

		saveOutput('july_test', output).then(done => {
			console.log(`Saved ${output.length} records to Firebase.`);
		}).catch(console.error);

	}).catch((err) => {
		console.error(`Error in Vote Details Promise.`);
		console.error(err);
	});

});

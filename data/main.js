const request = require('request');
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
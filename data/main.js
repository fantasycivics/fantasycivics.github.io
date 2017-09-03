const request = require('request');
request(`http://ocd.datamade.us/ocd-vote/2d11abcd-66e6-4c31-96ee-fa0d4f361ca2`, (error, response, body) => {
	console.log('error:', error); // Print the error if one occurred
	console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
	console.log('body:', body); // Print the HTML for the Google homepage.
});
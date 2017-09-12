let Views = () => {
	let views = {

		getAldersTable: (model) => {
			let html = `
				<thead>
					<tr>
						<th>Player</th>
						<th>Ward</th>
						<th>Projected</th>
						<th>Last Month</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
			`;
			model.rows.forEach((row) => {
				html += `
					<tr>
						<td>
							<span class="is-inline-img">
								<figure class="image is-32x32 headshot-holder is-rounded">
									<img class="headshot-img" src="../public/img/headshots/${row.playerid}.png" alt="${row.name}">
								</figure>
							</span>
							<span>${row.name}</span>
						</td>
						<td>${row.ward}</td>
						<td>${row.projected}</td>
						<td>${row.lastMonth}</td>
						<td>
							<button data-playerid="${row.playerid}" class="button is-primary is-outlined">View</button>
						</td>
					</tr>
				`;
			});
			html += `
				</tbody>
			`;
			let table = document.createElement('table');
				table.innerHTML = html;
				table.classList.add('table');
				table.classList.add('sortable-theme-bootstrap');
				table.setAttribute('data-sortable', true);
			return table;
		},

		getAlderView: (model) => {
			let html = `
			`;
			if (model.title) {
				html += `
					<p class="title is-3">${model.title}</p>
				`;
			}
			html += `
				<div class="media">
					<div class="media-left">
						<figure class="image is-64x64 headshot-holder">
							<img class="headshot-img" src="../public/img/headshots/${model.playerid}.png" alt="${model.profile.name}">
						</figure>
					</div>
					<div class="media-content">
						<p class="title is-4">${model.profile.name}</p>
						<p class="subtitle is-6 tags">
							<span class="tag">Ward ${model.profile.ward}</span>
							<span class="tag ${model.isFreeAgent ? 'is-success' : 'is-warning'}">${model.isFreeAgent ? 'Free Agent' : 'On Your Roster'}</span>
						</p>
					</div>
				</div>
				<hr>
				<p class="title is-5">${model.month} Points Breakdown</p>
				<table class="table is-fullwidth">
					<thead>
						<tr>
							<th>Category</th>
							<th>Points</th>
						</tr>
					</thead>
					<tbody>
			`;
			for (let bid in model.points) {
				let value = model.points[bid];
				html += `
					<tr>
						<td>${model.titles[bid]}</td>
						<td>${value > 0 ? '+' : ''}${value}</td>
					</tr>
				`;
			}
			html += `
				<tr>
					<th>Total</th>
					<th>${model.score}</th>
				</tr>
			`;
			html += `
					</tbody>
				</table>
			`;
			let div = document.createElement('div');
				div.innerHTML = html;
			return div;
		},

		getRosterTable: (model) => {
			let html = `
				<thead>
					<tr>
						<th>Position</th>
						<th>Player</th>
						<th>Ward</th>
						<th>Projected</th>
						<th>${model.lastMonth}</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
			`;
			model.rows.forEach((row) => {
				html += `
					<tr>
						<td>
							<span>${row.code}</span>
							<span data-positionkey="${row.position}" class="icon is-small helper-icon">
								<i class="fa fa-question-circle"></i>
							</span>
						</td>
						<td>
							<span class="is-inline-img">
								<figure class="image is-32x32 headshot-holder is-rounded">
									<img class="headshot-img" src="../public/img/headshots/${row.playerid || 'no-user'}.png" alt="${row.name}">
								</figure>
							</span>
							<span>${row.name}</span>
						</td>
						<td>${row.ward}</td>
						<td>
				`;
				if (row.playerid) {
					html += `
						<a class="is-underlined" data-playerid="${row.playerid}" data-action="view" data-position="${row.position}" data-projected="true">${row.projected}</a>
					`;
				} else {
					html += `
						${row.projected}
					`;
				}
				html += `
						</td>
						<td>${row.lastMonth}</td>
						<td>
				`;
				if (row.playerid) {
					html += `
						<button data-playerid="${row.playerid}" data-action="view" data-position="${row.position}" class="button is-primary is-outlined">View</button>
						<button data-playerid="${row.playerid}" data-action="drop" data-position="${row.position}" class="button is-danger is-outlined">Drop</button>
					`;
				} else {
					html += `
						<button data-playerid="${row.playerid}" data-action="fill" data-position="${row.position}" class="button is-primary is-outlined">Fill</button>
					`;
				}
				html += `
						</td>
					</tr>
				`;
			});
			html += `
				</tbody>
			`;
			let table = document.createElement('table');
				table.innerHTML = html;
				table.classList.add('table');
				table.classList.add('is-fullwidth');
			let tableDiv = document.createElement('div');
				tableDiv.classList.add('table-holder');
				tableDiv.appendChild(table);
			let scoreHTML = `
				<p class="has-text-centered">
					<span class="title is-5 tag is-transparent">Projected Total</span>
					<span class="title is-5 tag is-primary">${model.projected}</span>
					<span class="title is-5 tag is-transparent">${model.lastMonth} Total</span>
					<span class="title is-5 tag is-warning">${model.total}</span>
				</p>
			`;
			let scoreTable = document.createElement('div');
				scoreTable.innerHTML = scoreHTML;
				//scoreTable.classList.add('box');
			let div = document.createElement('div');
				div.appendChild(tableDiv);
				div.appendChild(scoreTable);
			return div;
		},

		getAddPlayerView: (model) => {
			let html = `
				<thead>
					<tr>
						<th>Position</th>
						<th>Name</th>
						<th>Ward</th>
						<th>Score</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
			`;
			model.rows.forEach((row) => {
				html += `
					<tr>
						<td>${row.code}</td>
						<td>${row.name}</td>
						<td>${row.ward}</td>
						<td>${row.lastMonth}</td>
						<td>
							<button data-position="${row.position}" class="button is-primary is-outlined">${row.playerid ? 'Replace' : 'Add'}</button>
						</td>
					</tr>
				`;
			});
			html += `
				</tbody>
			`;
			let table = document.createElement('table');
				table.innerHTML = html;
				table.classList.add('table');
				table.classList.add('is-fullwidth');
			let div = document.createElement('div');
				div.appendChild(table);
			return div;
		},

		getShareView: (model) => {
			let tweetLink = `https://twitter.com/home?status=Check%20out%20my%20%23FantasyCivics%20team%20at%20https%3A//fantasycivics.github.io/game/?roster=${model.hash}%20%40chihacknight`;
			let copyLink = `https://fantasycivics.github.io/game/?roster=${model.hash}`;
			let html = `
				<div class="content">
					<h2 class="title">Share Your Roster!</h2>
					<p class="subtitle">Tweet or copy this link to save your team. Share it with your friends and come back next month to see how well your team did!</p>
					<a href="${tweetLink}" target="_blank" class="button is-info is-outlined">
						<span class="icon">
							<i class="fa fa-twitter"></i>
						</span>
						<span>Tweet Link</span>	
					</a>
					<button class="button is-primary is-outlined" data-clipboard-text="${copyLink}">
						<span class="icon">
							<i class="fa fa-link"></i>
						</span>
						<span>Copy Link</span>				
					</button>
				</div>
			`;
			let div = document.createElement('div');
				div.innerHTML = html;
			return div;
		},

		getPositionExplanation: (model) => {
			let html = `
				<div class="content">
					<h2 class="title">${model.details.title} <span class="tag is-warning">${model.details.code}</span></h2>
					<p class="subtitle">${model.details.description}</p>
					<hr>
					<p class="title is-5">Scoring Overview</p>
					<table class="table">
						<thead>
							<tr>
								<th>Category</th>
								<th>Points</th>
							</tr>
						</thead>
						<tbody>
			`;
			model.fields.forEach((field) => {
				html += `
					<tr>
						<td>${model.titles[field]}</td>
						<td>${model.weights[field] > 0 ? '+' : ''}${model.weights[field]}</td>
					</tr>
				`;
			});
			html += `
						</tbody>
					</table>
				</div>
			`;
			let div = document.createElement('div');
				div.innerHTML = html;
			return div;
		}

	};
	return views;
};

export {Views};
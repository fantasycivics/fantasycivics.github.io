let Views = () => {
	let views = {

		getAldersTable: (model) => {
			let html = `
				<thead>
					<tr>
						<th>Player</th>
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
						<td>
							<span class="is-inline-img">
								<figure class="image is-32x32 headshot-holder is-rounded">
									<img class="headshot-img" src="../public/img/headshots/${row.playerid}.png" alt="${row.name}">
								</figure>
							</span>
							<span>${row.name}</span>
						</td>
						<td>${row.ward}</td>
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
						<td>
							<span class="is-inline-img">
								<figure class="image is-32x32 headshot-holder is-rounded">
									<img class="headshot-img" src="../public/img/headshots/${row.playerid || 'no-user'}.png" alt="${row.name}">
								</figure>
							</span>
							<span>${row.name}</span>
						</td>
						<td>${row.ward}</td>
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
			let scoreHTML = `
				<tbody>
					<tr>
						<td>
							<h3 class="title tag is-transparent">Total Score</h3>
						</td>
						<td>
							<h3 class="title tag is-primary">${model.total}</h3>
						</td>
					</tr>
				</tbody>
			`;
			let scoreTable = document.createElement('table');
				scoreTable.innerHTML = scoreHTML;
				scoreTable.classList.add('table');
				scoreTable.classList.add('is-narrow');
				//scoreTable.classList.add('is-right');
			let div = document.createElement('div');
				div.appendChild(table);
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
		}

	};
	return views;
};

export {Views};
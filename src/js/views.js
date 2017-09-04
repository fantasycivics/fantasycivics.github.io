let Views = () => {
	let views = {

		getAldersTable: (model) => {
			let html = `
				<thead>
					<tr>
						<th>Name</th>
						<th>Ward</th>
						<th>Score</th>
						<th>View</th>
					</tr>
				</thead>
				<tbody>
			`;
			model.rows.forEach((row) => {
				html += `
					<tr>
						<td>${row.name}</td>
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
						<figure class="image is-48x48 headshot-holder">
							<img class="headshot-img" src="../public/img/headshots/${model.playerid}.png" alt="${model.profile.name}">
						</figure>
					</div>
					<div class="media-content">
						<p class="title is-4">${model.profile.name}</p>
						<p class="subtitle is-6">Ward ${model.profile.ward}</p>
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
		}

	};
	return views;
};

export {Views};
const inputContainer = document.querySelector(".dropdown-container");
const inputSearch = document.querySelector("input");
const favorites = document.querySelector(".favorites");

favorites.addEventListener("click", (e) => {
	if (!e.target.classList.contains("btn-close")) return;
	e.target.parentElement.remove();
});

inputContainer.addEventListener("click", (e) => {
	if (!e.target.classList.contains("dropdown-content")) {
		return;
	}
	addChosen(e.target);
	inputSearch.value = "";
	removePredictions();
});

function removePredictions() {
	inputContainer.innerHTML = "";
}

function showPredictions(repositories) {
	const repositoriesToShow = repositories.items.slice(0, 5);
	removePredictions();

	const dropdownContents = repositoriesToShow.map(({ name, owner, stargazers_count }) =>
		`<div class="dropdown-content" data-owner="${owner.login}" data-stars="${stargazers_count}">${name}</div>`
	).join('');

	inputContainer.innerHTML = dropdownContents;
}

function addChosen(target) {
	const { textContent: name, dataset: { owner, stars } } = target;

	favorites.innerHTML += `
        <div class="chosen">Name: ${name}<br>Owner: ${owner}<br>Stars: ${stars}
            <button class="btn-close"></button>
        </div>`;
}

async function getPredictions() {
	const urlSearchRepositories = new URL("https://api.github.com/search/repositories");
	const repositoriesPart = inputSearch.value.trim();

	if (!repositoriesPart) {
		removePredictions();
		return;
	}

	urlSearchRepositories.searchParams.append("q", repositoriesPart);

	try {
		const response = await fetch(urlSearchRepositories);
		if (!response.ok) throw new Error('Network response was not ok');

		const repositories = await response.json();
		showPredictions(repositories);
	} catch (error) {
		console.error('Fetch error:', error);
	}
}

function debounce(fn, timeout) {
	let timer = null;

	return (...args) => {
		clearTimeout(timer);
		return new Promise((resolve) => {
			timer = setTimeout(() => resolve(fn(...args)), timeout);
		});
	};
}

const getResultRequest = debounce(getPredictions, 500);
inputSearch.addEventListener("input", getResultRequest);

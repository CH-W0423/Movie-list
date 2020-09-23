const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const togglers = document.querySelector("#togglers");

const MOVIES_PER_PAGE = 12;
const movies = []; //電影總清單
let filteredMovies = []; //搜尋清單
let mode = "card";
let page = 1;

// ------------  functions ------------ //
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";
  for (let pageNo = 1; pageNo <= numberOfPages; pageNo++) {
    rawHTML += `<li class="page-item"><a class="page-link" data-page="${pageNo}" href="#">${pageNo}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

function renderMovieList(data) {
  if (mode === "list") {
    let rawHTML = '<ul class="list-group col-12">';
    data.forEach((item) => {
      rawHTML += `<li class="list-group-item d-flex justify-content-between align-items-center">
      <span class="list-movie-title">${item.title}</span>
      <div class="buttons">
        <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
        <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
      </div>
      </li>`;
    });
    rawHTML += "</ul>";
    dataPanel.innerHTML = rawHTML;
  } else if (mode === "card") {
    let rawHTML = "";
    data.forEach((item) => {
      rawHTML += `<div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img
            src="${POSTER_URL + item.image}"
            class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${
                item.id
              }">+</button>
            </div>
          </div>
        </div>
      </div>`;
    });
    dataPanel.innerHTML = rawHTML;
  }
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

//選button 根據id將該筆電影的資料存到local storage的最愛電影
function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(event.target.dataset.id);
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
}

function movieModal(id) {
  const moviesModalTitle = document.querySelector("#movie-modal-title");
  const moviesModalImage = document.querySelector("#movie-modal-image");
  const moviesModalDate = document.querySelector("#movie-modal-date");
  const moviesModalDescription = document.querySelector(
    "#movie-modal-description"
  );
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    moviesModalTitle.innerText = data.title;
    moviesModalImage.innerHTML = `<img
        src="${POSTER_URL + data.image}"
        alt="movie-poster" class="img-fluid">`;
    moviesModalDate.innerHTML = `Release date: ${data.release_date}`;
    moviesModalDescription.innerText = data.description;
  });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }
  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  if (!keyword.length) {
    return alert("Search Name is empty!");
  }
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  if (!filteredMovies.length) {
    return alert(`您輸入的關鍵字: ${keyword} 沒有符合條件的電影`);
  }
  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(1));
}

function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;
  page = Number(event.target.dataset.page);
  renderMovieList(getMoviesByPage(page));
}

function onTogglersClicked(event) {
  if (event.target.matches("#card-mode-toggler")) {
    mode = "card";
  } else if (event.target.matches("#list-mode-toggler")) {
    mode = "list";
  }
  renderMovieList(getMoviesByPage(page));
}

dataPanel.addEventListener("click", onPanelClicked);
searchForm.addEventListener("submit", onSearchFormSubmitted);
paginator.addEventListener("click", onPaginatorClicked);
togglers.addEventListener("click", onTogglersClicked);

axios
  .get(INDEX_URL)
  .then(function (response) {
    movies.push.apply(movies, response.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(page));
  })
  .catch((err) => console.log(err));

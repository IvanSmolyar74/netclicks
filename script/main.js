//  menu

const IMG_URL = "https://image.tmdb.org/t/p/w185_and_h278_bestv2";

const leftMenu = document.querySelector(".left-menu"),
  hamburger = document.querySelector(".hamburger"),
  tvShowsList = document.querySelector(".tv-shows__list"),
  modal = document.querySelector(".modal"),
  tvShows = document.querySelector(".tv-shows"),
  tvCardImg = document.querySelector(".tv-card__img"),
  modalTitle = document.querySelector(".modal__title"),
  genresList = document.querySelector(".genres-list"),
  rating = document.querySelector(".rating"),
  description = document.querySelector(".description"),
  modalLink = document.querySelector(".modal__link"),
  searchForm = document.querySelector(".search__form"),
  searchFormInput = document.querySelector(".search__form-input"),
  preloader = document.querySelector(".preloader"),
  dropdown = document.querySelectorAll(".dropdown"),
  tvShowsHead = document.querySelector(".tv-shows__head"),
  posterWrapper = document.querySelector(".poster__wrapper"),
  modalContent = document.querySelector(".modal__content"),
  pagination = document.querySelector(".pagination"),
  trailer = document.getElementById("trailer"),
  headTrailer = document.querySelector("#headTrailer");

const loading = document.createElement("div");
loading.className = "loading";

const DBService = class {
  constructor() {
    this.SERVER = "https://api.themoviedb.org/3";
    this.API_KEY = "e0274238ed41360ca743a98273d86c8c";
  }

  getData = async (url) => {
    const res = await fetch(url);
    if (res.ok) {
      return res.json();
    } else {
      throw new Error(`Неудалось получить данные по адресу ${url}`);
    }
  };

  getSearchResult = (query) => {
    this.temp = `${this.SERVER}/search/tv?api_key=${this.API_KEY}&query=${query}&language=ru-Ru`;
    return this.getData(this.temp);
  };

  getNaextPage = (page) => {
    return this.getData(this.temp + "&page=" + page);
  };

  getTvShow = (id) =>
    this.getData(
      `${this.SERVER}/tv/${id}?api_key=${this.API_KEY}&language=ru-RU`
    );

  getTopRated = () =>
    this.getData(
      `${this.SERVER}/tv/top_rated?api_key=${this.API_KEY}&language=ru-RU`
    );

  getPopular = () =>
    this.getData(
      `${this.SERVER}/tv/popular?api_key=${this.API_KEY}&language=ru-RU`
    );

  getWeek = () =>
    this.getData(
      `${this.SERVER}/tv/on_the_air?api_key=${this.API_KEY}&language=ru-RU`
    );

  getToday = () =>
    this.getData(
      `${this.SERVER}/tv/airing_today?api_key=${this.API_KEY}&language=ru-RU`
    );

  getVideo = (id) => {
    return this.getData(
      `${this.SERVER}/tv/${id}/videos?api_key=${this.API_KEY}&language=ru-RU`
    );
  };
};

const dbService = new DBService();

console.log(dbService.getSearchResult("игра престолов"));
console.log(dbService.getTopRated());

const renderCard = (response, target) => {
  tvShowsList.textContent = "";

  if (!response.total_results) {
    loading.remove();
    tvShowsHead.textContent =
      "К сожаления по вашему запросу ничего не найдено...";
    tvShowsHead.style.cssText = "color: red; border-bottom: 3px solid red;";
    return;
  }

  tvShowsHead.textContent = target ? target.textContent : "Результат поиска:";
  tvShowsHead.style.cssText = "color: green;";

  response.results.forEach((item) => {
    const {
      backdrop_path: backdrop,
      name: title,
      poster_path: poster,
      vote_average: vote,
      id,
    } = item;

    const posterIMG = poster ? IMG_URL + poster : "img/no-poster.jpg";
    const backdropIMG = backdrop ? IMG_URL + backdrop : "";
    const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : "";

    const card = document.createElement("li");
    card.idTV = id;
    card.classList.add("tv-shows__item");
    card.innerHTML = `
            <a href="#" id="${id}" class="tv-card">
                ${voteElem}
                <img class="tv-card__img"
                        src="${posterIMG}"
                        data-backdrop="${backdropIMG}"
                        alt="${title}">
                <h4 class="tv-card__head">${title}</h4>
            </a>
        `;
    loading.remove();
    tvShowsList.append(card);
  });

  pagination.textContent = "";

  if (target && response.total_pages > 1) {
    for (let i = 1; i <= response.total_pages; i++) {
      pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`;
    }
  }
};

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = searchFormInput.value.trim();
  if (value) {
    dbService.getSearchResult(value).then(renderCard);
  }
  searchFormInput.value = "";
});

// открытие - закрытие меню

const closeDropdown = () => {
  dropdown.forEach((item) => {
    item.classList.remove("active");
  });
};

hamburger.addEventListener("click", () => {
  leftMenu.classList.toggle("openMenu");
  hamburger.classList.toggle("open");
  closeDropdown();
});

// закрыть меню при клике мимо неё
// closest - это метод, который подниматся по ДОМ дереву пока не найдет заданный класс. Если не находит, то возвращает null.

document.addEventListener("click", (e) => {
  if (!e.target.closest(".left-menu")) {
    leftMenu.classList.remove("openMenu");
    hamburger.classList.remove("open");
    closeDropdown();
  }
});

// раскрытие вложенного списка в меню

leftMenu.addEventListener("click", (e) => {
  e.preventDefault();
  const target = e.target;
  const dropdown = target.closest(".dropdown");
  if (dropdown) {
    dropdown.classList.toggle("active");
    leftMenu.classList.add("openMenu");
    hamburger.classList.add("open");
  }

  if (target.closest("#top-rated")) {
    tvShows.append(loading);
    dbService.getTopRated().then((response) => renderCard(response, target));
  }
  if (target.closest("#popular")) {
    tvShows.append(loading);
    dbService.getPopular().then((response) => renderCard(response, target));
  }
  if (target.closest("#week")) {
    tvShows.append(loading);
    dbService.getWeek().then((response) => renderCard(response, target));
  }
  if (target.closest("#today")) {
    tvShows.append(loading);
    dbService.getToday().then((response) => renderCard(response, target));
  }
  if (target.closest("#search")) {
    tvShowsList.textContent = ""; // поиск в меню, очищает страницу
    tvShowsHead.textContent = "";
  }
});

// смена карточки при наведеении

const changeImage = (event) => {
  const card = event.target.closest(".tv-shows__item");
  if (card) {
    const img = card.querySelector(".tv-card__img");
    if (img.dataset.backdrop) {
      [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
    }
  }
};

tvShowsList.addEventListener("mouseover", changeImage);
tvShowsList.addEventListener("mouseout", changeImage);

// открытие модального окна

tvShowsList.addEventListener("click", (event) => {
  event.preventDefault();

  const target = event.target;
  const card = target.closest(".tv-card");

  if (card) {
    preloader.style.display = "block";

    new DBService()
      .getTvShow(card.id)
      .then(
        ({
          poster_path: posterPath,
          name: title,
          genres,
          vote_average: voteAverage,
          overview,
          homepage,
          id,
        }) => {
          if (posterPath) {
            tvCardImg.src = IMG_URL + posterPath;
            tvCardImg.alt = title;
            posterWrapper.style.display = "";
            modalContent.style.paddingLeft = "";
          } else {
            posterWrapper.style.display = "none";
            modalContent.style.paddingLeft = "25px";
          }

          modalTitle.textContent = title;
          // genresList.innerHTML = response.genres.reduce((acc, item) => `${acc}<li>${item.name}</li>`, '');
          genresList.textContent = "";
          for (const item of genres) {
            genresList.innerHTML += `<li>${item.name}</li>`;
          }
          rating.textContent = voteAverage;
          description.textContent = overview;
          modalLink.href = homepage;
          return id;
        }
      )
      .then(dbService.getVideo)
      .then((response) => {
        headTrailer.classList.add("hide");
        trailer.textContent = "";
        if (response.results.length) {
          headTrailer.classList.remove("hide");
          response.results.forEach((item) => {
            const trailerItem = document.createElement("li");

            trailerItem.innerHTML = `
                        <iframe 
                            width="400"
                            height="300"
                            src="https://www.youtube.com/embed/${item.key}" 
                            frameborder="0"
                            allowfullscreen>
                        </iframe>
                        <h4>${item.name}</h4>
                    `;

            trailer.append(trailerItem);
          });
        }
      })
      .then(() => {
        document.body.style.overflow = "hidden";
        modal.classList.remove("hide");
      })
      .finally(() => {
        preloader.style.display = "";
      });
  }
});

// закрытие модального окна

modal.addEventListener("click", (event) => {
  if (
    event.target.closest(".cross") ||
    event.target.classList.contains("modal")
  ) {
    document.body.style.overflow = "";
    modal.classList.add("hide");
  }
});

pagination.addEventListener("click", (event) => {
  event.preventDefault();
  const target = event.target;

  if (target.classList.contains("pages")) {
    tvShows.append(loading);
    dbService.getNaextPage(target.textContent).then(renderCard);
  }
});

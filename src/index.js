import axios, { isCancel, AxiosError } from 'axios';
import Notiflix from 'notiflix';
// Описаний в документації
import SimpleLightbox from "simplelightbox";
// Додатковий імпорт стилів
import "simplelightbox/dist/simple-lightbox.min.css";

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '39188686-aaef76240829aa5a1004b5869';
const PER_PAGE = 40;
let currentPage = 1;
let currentQuery = '';

const refs = {
    findImage: document.querySelector("#find-image"),
    form: document.querySelector("#search-form"),
    gallery: document.querySelector(".gallery"),
    loadMore: document.querySelector(".load-more"),
};

refs.form.addEventListener('submit', onSubmitForm);
var lightbox = new SimpleLightbox('.gallery a', {captionsData: "alt", captionDelay: 250, scrollZoomFactor: 0.05 });

// перша сторінка галереї за запитом 
async function onSubmitForm(evt) {
    evt.preventDefault();
    const { elements: { searchQuery } } = evt.currentTarget;
    currentQuery = searchQuery.value;
    currentPage = 1;
   
    const params = new URLSearchParams({
        key: API_KEY,
        q: currentQuery,
        image_type: "photo",
        orientation: "horizontal",
        safesearch: true,
        per_page: PER_PAGE,
        page: currentPage,
    });

    try {
        const obj = await axios.get(BASE_URL, { params });
        Notiflix.Notify.success(`Total find ${obj.data.totalHits} pictures`);
        refs.gallery.innerHTML = makeMarkup(obj);
        lightbox.refresh();
        checkPages(obj.data.totalHits);
    }catch (error){
        Notiflix.Notify.failure(`Error read API!!! ${error}`);
    };
};    

// наступні сторінки галереї
async function onClickLoadMore() {
    currentPage += 1;

    const params = new URLSearchParams({
        key: API_KEY,
        q: currentQuery,
        image_type: "photo",
        orientation: "horizontal",
        safesearch: true,
        per_page: PER_PAGE,
        page: currentPage,
    });

    try {
        const obj = await axios.get(BASE_URL, { params });
        refs.gallery.insertAdjacentHTML('beforeend', makeMarkup(obj));
        lightbox.refresh();
        checkPages(obj.data.totalHits);
    } catch (error){
        Notiflix.Notify.failure(`Error read API!!! ${error}`);
    };
};

// перевірка, чи не дійшли останньої сторінки галереї
function checkPages(totalHits) {
    if (totalHits > currentPage * PER_PAGE) {
        refs.loadMore.classList.remove('is-hidden');
        refs.loadMore.addEventListener('click', onClickLoadMore);
        return;
    };
        refs.loadMore.classList.add('is-hidden');
        if (currentPage > 1) {
            refs.loadMore.removeEventListener('click', onClickLoadMore);
        };
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results");
};

// формування розмітки сторінки галереї
function makeMarkup(obj) {
    const { data: { hits } } = obj;
    console.dir(hits);
    const markup = hits.map(({ comments, likes, views, downloads, previewURL, webformatURL, tags, largeImageURL }) => {
    return `<a class="gallery__link link" href="${largeImageURL}">
<img class="gallery__image" src="${webformatURL}" alt="${tags}" />
<ul class="card-info-js">
  <li>
    <h2 class="card-head-js">Likes</h2>
    <p class="card-text-js">${likes}</p>
  </li>
  <li>
    <h2 class="card-head-js">Views</h2>
    <p class="card-text-js">${views}</p>
  </li>
  <li>
    <h2 class="card-head-js">Comments</h2>
    <p class="card-text-js">${comments}</p>
  </li>
  <li>
    <h2 class="card-head-js">Downloads</h2>
    <p class="card-text-js">${downloads}</p>
  </li>
</ul>
</a>` }).join('');
    return markup;
}

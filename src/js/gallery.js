import { PixabayAPI } from './PixabayAPI';
import createGalleryCards from '../templates/gallery-cards.hbs';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

const refs = {
  gallery: document.querySelector('.gallery'),
  searchForm: document.querySelector('#search-form'),
};

let lightbox = new SimpleLightbox('.gallery-link', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

const pixabayApi = new PixabayAPI();

async function onRenderPage() {
  try {
    const respons = await pixabayApi.getPopularPhotos();
    refs.gallery.innerHTML = createGalleryCards(respons.data.hits);
    lightbox.refresh();
    autoScroll();
  } catch (err) {
    console.log(err);
  }
}

onRenderPage();

refs.searchForm.addEventListener('submit', onSearchFormSubmit);

async function onSearchFormSubmit(event) {
  event.preventDefault();

  refs.gallery.innerHTML = '';

  const searchQuery = event.currentTarget.elements.searchQuery.value.trim();
  pixabayApi.query = searchQuery;
  pixabayApi.resetPage();
  pixabayApi.page = 1;

  if (!searchQuery) {
    alertNoEmptySearch();
    return;
  }

  onLoadMore();

  return;
}

async function onLoadMore() {
  try {
    const response = await pixabayApi.fetchPhotosByQuery();
    const totalPicturs = response.data.totalHits;
    const lastPage = Math.ceil(totalPicturs / pixabayApi.per_page);

    if (totalPicturs === 0) {
      alertNoEmptySearch();
      return;
    }

    createMarkup(response.data.hits);

    lightbox.refresh();
    autoScroll();

    if (pixabayApi.page === 1) {
      Notiflix.Notify.success(`Hooray! We found ${totalPicturs} images.`);

      if (totalPicturs <= pixabayApi.per_page) {
        alertEndOfSearch();
        return;
      }
    }

    if (lastPage > pixabayApi.page) {
      if (pixabayApi.page === 1) {
        window.addEventListener('scroll', handleScroll);
      }
      pixabayApi.page += 1;
    } else {
      if (lastPage === pixabayApi.page) {
        window.removeEventListener('scroll', handleScroll);
        alertEndOfSearch();
        return;
      }
    }
  } catch (err) {
    alertEndOfSearch();
  }
}

function createMarkup(hits) {
  const markup = createGalleryCards(hits);
  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function alertNoEmptySearch() {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

function alertEndOfSearch() {
  Notiflix.Notify.warning(
    "We're sorry, but you've reached the end of search results."
  );
}

function handleScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    onLoadMore();
  }
}

function autoScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

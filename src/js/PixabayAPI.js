import axios from 'axios';

export class PixabayAPI {
  #BASE_URL = 'https://pixabay.com/api/';
  #API_KEY = '35542467-e178fad6fcbc032b2bfc96ff5';
  #query = '';

  constructor() {
    this.page = 1;
    this.per_page = 40;
  }

  getPopularPhotos(page) {
    return axios.get(`${this.#BASE_URL}`, {
      params: {
        q: 'random',
        page,
        per_page: this.per_page,
        key: this.#API_KEY,
      },
    });
  }

  fetchPhotosByQuery() {
    return axios.get(`${this.#BASE_URL}`, {
      params: {
        q: this.#query,
        page: this.page,
        per_page: this.per_page,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: ' true',
        key: this.#API_KEY,
      },
    });
  }

  resetPage() {
    this.page = 1;
  }

  incrementPage() {
    this.page += 1;
  }

  get query() {
    return this.#query;
  }

  set query(newQuery) {
    this.#query = newQuery;
  }
}

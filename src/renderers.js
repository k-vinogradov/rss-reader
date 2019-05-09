import WatchJS from 'melanke-watchjs';
// eslint-disable-next-line no-unused-vars
import Modal from 'bootstrap/js/dist/modal';
// eslint-disable-next-line no-unused-vars
import Collapse from 'bootstrap/js/dist/collapse';
import $ from 'jquery';
import { showDetail } from './controllers';

const createElement = (tag, text = '', ...classes) => {
  const element = document.createElement(tag);
  if (text.length > 0) element.textContent = text;
  if (classes.length > 0) element.classList.add(...classes);
  return element;
};

const buildTree = (root, ...children) => {
  children.forEach(child => root.appendChild(child));
  return root;
};

const renderLoading = ({ loading }) => $('#loadingModal').modal(loading ? 'show' : 'hide');

const renderForm = ({ form: { state, value } }) => {
  const input = document.getElementById('addFeedInput');
  const button = document.getElementById('addFeedButton');
  input.value = value;
  switch (state) {
    case 'init':
      input.classList.remove('is-invalid');
      button.disabled = true;
      break;
    case 'invalid':
      input.classList.add('is-invalid');
      button.disabled = true;
      break;
    case 'valid':
      input.classList.remove('is-invalid');
      button.disabled = false;
      break;
    default:
  }
};

const renderListItem = ({ title, link, description }, state) => {
  const detailButton = createElement('button', 'Detail...');
  detailButton.addEventListener('click', () => showDetail({ title, description }, state));
  const anchor = createElement('a', title);
  anchor.href = link;
  return buildTree(createElement('li'), anchor, detailButton);
};

const renderFeed = ({
  title, description, content, url,
}, state) => buildTree(
  createElement('li', '', 'feed'),
  buildTree(
    createElement('h2'),
    createElement('span', `${title} `),
    createElement('span', `${content.length}`, 'badge', 'badge-secondary'),
  ),
  createElement('small', url),
  createElement('p', description),
  buildTree(createElement('ul'), ...content.map(item => renderListItem(item, state))),
);

const renderAllFeeds = (state) => {
  const container = document.getElementById('feedsDataContainer');
  while (container.firstChild) container.removeChild(container.firstChild);
  container.appendChild(
    buildTree(
      document.createElement('ul'),
      ...state.feeds.allURLs.map(url => renderFeed(state.feeds.byURL[url], state)),
    ),
  );
};

const renderDetail = ({ detail }) => {
  if (!detail) {
    $('#feedDetail').modal('hide');
    return;
  }
  const { title, description } = detail;
  document.getElementById('feedDetailLabel').textContent = title;
  document.getElementById('feedDetailBody').innerHTML = description;
  $('#feedDetail').modal('show');
};

const renderError = ({ error }) => {
  if (!error) {
    $('#error').collapse('hide');
    return;
  }
  const { url, reason } = error;
  document.getElementById('error.url').textContent = url;
  document.getElementById('error.reason').textContent = reason;
  $('#error').collapse('show');
};

const enable = (state) => {
  WatchJS.watch(state, 'form', () => renderForm(state));
  WatchJS.watch(state, 'feeds', () => renderAllFeeds(state));
  WatchJS.watch(state, 'detail', () => renderDetail(state));
  WatchJS.watch(state, 'error', () => renderError(state));
  WatchJS.watch(state, 'loading', () => renderLoading(state));
  renderForm(state);
};

export default enable;

import WatchJS from 'melanke-watchjs';
// eslint-disable-next-line no-unused-vars
import Modal from 'bootstrap/js/dist/modal';
import $ from 'jquery';
import { showFeedDetail, reloadFeed, openFeedEditForm } from './controllers';

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

const renderForm = ({ addUrlFormState }) => {
  const input = document.getElementById('addFeedInput');
  const button = document.getElementById('addFeedButton');
  const formRenderersMap = {
    init: () => {
      input.classList.remove('is-invalid');
      input.value = '';
      button.disabled = true;
    },
    invalid: () => {
      input.classList.add('is-invalid');
      input.value = addUrlFormState.value;
      button.disabled = true;
    },
    valid: () => {
      input.classList.remove('is-invalid');
      input.value = addUrlFormState.value;
      button.disabled = false;
    },
  };
  formRenderersMap[addUrlFormState.state]();
};

const renderNewFeed = ({ url }) => buildTree(
  createElement('li', '', 'feed'),
  createElement('h2', 'Loading Feed'),
  buildTree(
    createElement('div', '', 'url'),
    createElement('span', '', 'spinner'),
    createElement('span', url),
  ),
);

const renderErrorFeed = ({ uid, url, error }, state) => {
  const reloadButton = createElement('button', 'Reload');
  reloadButton.addEventListener('click', () => reloadFeed(uid, state));
  const editButton = createElement('button', 'Edit');
  editButton.addEventListener('click', () => openFeedEditForm(uid, state));
  return buildTree(
    createElement('li', '', 'feed', 'errorFeed'),
    createElement('h2', 'Invalid Feed'),
    createElement('small', url),
    buildTree(
      createElement('p'),
      createElement('span', 'Failed to read RSS data due the following reason: '),
      createElement('strong', error),
    ),
    editButton,
    reloadButton,
  );
};

const renderListItem = ({ title, link, description }, state) => {
  const detailButton = createElement('button', 'Detail...');
  detailButton.addEventListener('click', () => showFeedDetail(state, title, description));
  const anchor = createElement('a', title);
  anchor.href = link;
  return buildTree(createElement('li'), anchor, detailButton);
};

const renderCompleteFeed = ({
  title, description, content, url,
}, state) => buildTree(
  createElement('li', '', 'feed'),
  createElement('h2', title),
  createElement('small', url),
  createElement('p', description),
  buildTree(createElement('ul'), ...content.map(item => renderListItem(item, state))),
);

const renderFeed = (feed, state) => {
  const { status } = feed;
  const renderersMap = {
    loading: renderNewFeed,
    error: renderErrorFeed,
    complete: renderCompleteFeed,
  };
  return renderersMap[status](feed, state);
};

const renderAllFeeds = (state) => {
  const container = document.getElementById('feedsDataContainer');
  while (container.firstChild) container.removeChild(container.firstChild);
  buildTree(
    container,
    buildTree(
      document.createElement('ul'),
      ...state.feeds.allUIDs.map(uid => renderFeed(state.feeds.byUID[uid], state)),
    ),
  );
};

const renderFeedDetail = ({ feedDetailToShow }) => {
  if (feedDetailToShow === null) {
    $('#feedDetail').modal('hide');
    return;
  }
  const { title, description } = feedDetailToShow;
  document.getElementById('feedDetailLabel').textContent = title;
  document.getElementById('feedDetailBody').innerHTML = description;
  $('#feedDetail').modal('show');
};

const renderFeedEditModal = ({ showFeedEditForm }) => $('#feedUpdate').modal(showFeedEditForm ? 'show' : 'hide');

const renderFeedEditForm = ({ feedEditFormState }) => {
  const input = document.getElementById('feedUpdateInput');
  const button = document.getElementById('updateFeedButton');
  const formRenderersMap = {
    invalid: () => {
      input.classList.add('is-invalid');
      input.value = feedEditFormState.value;
      button.disabled = true;
    },
    valid: () => {
      input.classList.remove('is-invalid');
      input.value = feedEditFormState.value;
      button.disabled = false;
    },
  };
  formRenderersMap[feedEditFormState.state]();
};

const enable = (state) => {
  WatchJS.watch(state, 'addUrlFormState', () => renderForm(state));
  WatchJS.watch(state, 'feeds', () => renderAllFeeds(state));
  WatchJS.watch(state, 'feedDetailToShow', () => renderFeedDetail(state));
  WatchJS.watch(state, 'feedEditFormState', () => renderFeedEditForm(state));
  WatchJS.watch(state, 'showFeedEditForm', () => renderFeedEditModal(state));
  renderForm(state);
};

export default enable;

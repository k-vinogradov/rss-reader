import WatchJS from 'melanke-watchjs';
// eslint-disable-next-line no-unused-vars
import Modal from 'bootstrap/js/dist/modal';
import $ from 'jquery';
import { showFeedDetail } from './controllers';

const appendChildren = (node, ...children) => children.forEach(child => node.appendChild(child));

const renderForm = ({ formState }) => {
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
      input.value = formState.value;
      button.disabled = true;
    },
    valid: () => {
      input.classList.remove('is-invalid');
      input.value = formState.value;
      button.disabled = false;
    },
  };

  formRenderersMap[formState.state]();
};

const renderNewFeed = ({ uid, url }) => {
  console.log('Render new feed');
  const feed = document.createElement('div');
  feed.id = `feed-container-${uid}`;
  feed.classList.add('container');

  const header = document.createElement('div');
  header.classList.add('d-flex', 'align-items-center', 'h2');

  const title = document.createElement('span');
  title.textContent = 'Loading...';

  const spinner = document.createElement('div');
  spinner.classList.add('spinner-border', 'ml-auto');

  appendChildren(header, title, spinner);

  const content = document.createElement('p');
  content.textContent = url;

  appendChildren(feed, header, content);
  return feed;
};

const renderDetailButton = (title, description, state) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.classList.add('btn', 'btn-light');
  button.textContent = '?';
  button.addEventListener('click', () => showFeedDetail(state, title, description));
  return button;
};

const renderListItem = ({ title, link, description }, state) => {
  const listItem = document.createElement('li');
  const anchor = document.createElement('a');
  anchor.textContent = title;
  anchor.href = link;
  appendChildren(listItem, anchor, renderDetailButton(title, description, state));
  return listItem;
};

const renderCompleteFeed = ({ title, description, content }, state) => {
  console.log('Render complete feed');
  const feedElement = document.createElement('div');
  feedElement.classList.add('container');

  const header = document.createElement('h2');
  header.textContent = title;

  const descriptionParagraph = document.createElement('p');
  descriptionParagraph.textContent = description;

  const contentList = document.createElement('ul');
  content.map(item => renderListItem(item, state)).forEach(item => contentList.appendChild(item));

  appendChildren(feedElement, header, descriptionParagraph, contentList);
  return feedElement;
};

const renderFeed = (feed, state) => {
  console.log('Render all feeds');
  const { status } = feed;
  const renderersMap = {
    new: renderNewFeed,
    complete: renderCompleteFeed,
  };
  return renderersMap[status](feed, state);
};

const renderAllFeeds = (state) => {
  const container = document.getElementById('feedsDataContainer');
  while (container.firstChild) container.removeChild(container.firstChild);
  state.feeds.allUIDs
    .map(uid => renderFeed(state.feeds.byUID[uid], state))
    .forEach(node => container.appendChild(node));
};

const renderFeedDetail = ({ feedDetailToShow }) => {
  if (feedDetailToShow === null) {
    $('#feedDetail').modal('hide');
    return;
  }
  const { title, description } = feedDetailToShow;
  document.getElementById('feedDetailLabel').textContent = title;
  document.getElementById('feedDetailBody').textContent = description;
  $('#feedDetail').modal('show');
};


const enable = (state) => {
  WatchJS.watch(state, 'formState', () => renderForm(state));
  WatchJS.watch(state, 'feeds', () => renderAllFeeds(state));
  WatchJS.watch(state, 'feedDetailToShow', () => renderFeedDetail(state));
  renderForm(state);
};

export default enable;

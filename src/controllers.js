import _ from 'lodash';
import isURL from 'validator/lib/isURL';
import load from './loader';

const listUpdateInterval = 5000;

const setState = (state, path, value) => {
  /*
    WatchJS doesn't check if the actual values have been changed. It causes event triggering
    if the new object with the same content has been added. So we need some wrapper to avoid
    such false runnings.
  */
  if (_.isEqual(_.get(state, path), value)) return;
  _.set(state, path, value);
};

/*
  Because of using lodath "path" syntax to access state in the setState() function
  we can't use URL string as a key. We have to encode it by using hash/encoding
  function. Base64 is a good one.
*/
const getUrlUID = url => btoa(url);

const resetNewUrlFormState = state => setState(state, 'newUrlFormSate', { state: 'init', value: '' });

const isURLValid = ({ feeds }, url) => isURL(url) && !feeds.allUIDs.includes(getUrlUID(url));

const handleFormInput = ({ target }, state) => {
  const newState = (value) => {
    if (value.length === 0) return 'init';
    return isURLValid(state, value) ? 'valid' : 'invalid';
  };

  const { value } = target;
  setState(state, 'newUrlFormSate', { state: newState(value), value });
};

const loadFeed = (state, uid) => {
  const { feeds } = state;
  const feed = feeds.byUID[uid];
  const path = `feeds.byUID.${uid}`;
  load(feed.url)
    .then(parsed => setState(state, path, { ...feed, ...parsed, status: 'complete' }))
    .catch(error => setState(state, path, { ...feed, error: error.message, status: 'error' }));
};

const reloadFeed = (uid, state) => {
  setState(state, `feeds.byUID.${uid}.status`, 'loading');
  loadFeed(state, uid);
};

const handleFormSubmit = (event, state) => {
  event.preventDefault();
  if (state.newUrlFormSate.state !== 'valid') return;
  const url = state.newUrlFormSate.value;
  const uid = getUrlUID(url);
  const feed = { uid, url, status: 'loading' };
  setState(state, 'feeds', {
    allUIDs: [...state.feeds.allUIDs, uid],
    byUID: { ...state.feeds.byUID, [uid]: feed },
  });
  resetNewUrlFormState(state);
  loadFeed(state, uid);
};

const showFeedDetail = (state, title, description) => setState(state, 'feedDetailToShow', { title, description });

const hideFeedDetail = state => setState(state, 'feedDetailToShow', null);

const updateFeeds = (state) => {
  const { feeds } = state;
  const updatingTasks = feeds.allUIDs
    .map(uid => feeds.byUID[uid])
    .filter(feed => feed.status === 'complete')
    .map(feed => load(feed.url)
      .then(parsed => ({
        ...feed,
        content: _.unionWith(feed.content, parsed.content, _.isEqual),
      }))
      .then(updated => ({ [feed.uid]: updated }))
      .catch(() => {}));
  Promise.all(updatingTasks)
    .then((updatedFeeds) => {
      const updatedData = updatedFeeds
        .filter(item => item !== undefined)
        .reduce((acc, feed) => ({ ...acc, ...feed }), {});
      setState(state, 'feeds.byUID', { ...feeds.byUID, ...updatedData });
    })
    .finally(() => setTimeout(() => updateFeeds(state), listUpdateInterval));
};

const openFeedEditForm = (uid, state) => {
  setState(state, 'feedEditFormState', {
    state: 'valid',
    value: state.feeds.byUID[uid].url,
    uid,
  });
  setState(state, 'showFeedEditForm', true);
};

const closeFeedEditForm = state => setState(state, 'showFeedEditForm', false);

const handleFeedEditInput = ({ target }, state) => {
  const { value } = target;
  const { uid } = state.feedEditFormState;
  const currentValue = state.feeds.byUID[uid].url;
  if (value === currentValue) {
    setState(state, 'feedEditFormState', { ...state.feedEditFormState, value, state: 'valid' });
    return;
  }
  setState(state, 'feedEditFormState', {
    ...state.feedEditFormState,
    value,
    state: isURLValid(state, value) ? 'valid' : 'invalid',
  });
};

const handleEditFormSubmit = (event, state) => {
  event.preventDefault();
  const formState = state.feedEditFormState;
  const { uid } = formState;
  if (formState.state !== 'valid') return;
  setState(state, `feeds.byUID.${uid}`, { uid, url: formState.value, status: 'loading' });
  closeFeedEditForm(state);
  loadFeed(state, uid);
};

const enable = (state) => {
  [
    ['addFeedForm', 'submit', event => handleFormSubmit(event, state)],
    ['addFeedInput', 'input', event => handleFormInput(event, state)],
    ['closeFeedDetailButton', 'click', () => hideFeedDetail(state)],
    ['closeFeedDetailHeaderButton', 'click', () => hideFeedDetail(state)],
    ['feedUpdateForm', 'submit', event => handleEditFormSubmit(event, state)],
    ['feedUpdateInput', 'input', event => handleFeedEditInput(event, state)],
    ['closeFeedUpdateHeaderButton', 'click', () => closeFeedEditForm(state)],
    ['closeFeedUpdateButton', 'click', () => closeFeedEditForm(state)],
  ].forEach(([id, event, func]) => document.getElementById(id).addEventListener(event, func));
  setTimeout(() => updateFeeds(state), listUpdateInterval);
};

export default enable;
export { showFeedDetail, reloadFeed, openFeedEditForm };

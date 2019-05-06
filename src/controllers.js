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

const resetFormState = state => setState(state, 'formState', { state: 'init', value: '' });

const handleFormInput = ({ target }, state) => {
  const isValid = value => isURL(value) && !state.feeds.allUIDs.includes(getUrlUID(value));

  const newState = (value) => {
    if (value.length === 0) return 'init';
    return isValid(value) ? 'valid' : 'invalid';
  };

  const { value } = target;
  setState(state, 'formState', { state: newState(value), value });
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
  if (state.formState.state !== 'valid') return;
  const url = state.formState.value;
  const uid = getUrlUID(url);
  const feed = { uid, url, status: 'loading' };
  setState(state, 'feeds', {
    allUIDs: [...state.feeds.allUIDs, uid],
    byUID: { ...state.feeds.byUID, [uid]: feed },
  });
  resetFormState(state);
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

const enable = (state) => {
  document
    .getElementById('addFeedForm')
    .addEventListener('submit', event => handleFormSubmit(event, state));
  document
    .getElementById('addFeedInput')
    .addEventListener('input', event => handleFormInput(event, state));
  document
    .getElementById('closeFeedDetailButton')
    .addEventListener('click', () => hideFeedDetail(state));
  document
    .getElementById('closeFeedDetailHeaderButton')
    .addEventListener('click', () => hideFeedDetail(state));
  setTimeout(() => updateFeeds(state), listUpdateInterval);
};

export default enable;
export { showFeedDetail, reloadFeed };

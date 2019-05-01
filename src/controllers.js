import _ from 'lodash';
import isURL from 'validator/lib/isURL';
import load from './loader';

const setState = (state, path, value) => {
  /*
    WatchJS doesn't check if the actual values have been changed. It causes event triggering
    if the new object with the same content has been added. So we need some wrapper to avoid
    such false runnings.
  */
  if (_.isEqual(_.get(state, path), value)) return;
  _.set(state, path, value);
};

const resetFormState = state => setState(state, 'formState', { state: 'init', value: '' });

const handleFormInput = ({ target }, state) => {
  const isValid = (value) => {
    if (!isURL(value)) return false;
    const feeds = state.feeds.byUID;
    return !_.findKey(feeds, feed => feed.url === value);
  };

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
    .catch((error) => {
      console.log(error);
      setTimeout(() => loadFeed(state, uid), 10000);
    });
};

const handleFormSubmit = (event, state) => {
  event.preventDefault();
  if (state.formState.state !== 'valid') return;
  const uid = `feed${_.uniqueId()}`;
  const url = state.formState.value;
  const feed = { uid, url, status: 'new' };
  setState(state, 'feeds', {
    allUIDs: [...state.feeds.allUIDs, uid],
    byUID: { ...state.feeds.byUID, [uid]: feed },
  });
  resetFormState(state);
  loadFeed(state, uid);
};

const showFeedDetail = (state, title, description) => setState(state, 'feedDetailToShow', { title, description });

const resetFeedDetail = (state) => {
  state.feedDetailToShow = null;
};

const updateFeeds = (state) => {
  console.log('Time to update out feeds...');
  const { feeds } = state;
  const updatingTasks = feeds.allUIDs
    .map(uid => feeds.byUID[uid])
    .filter(feed => feed.status === 'complete')
    .map(feed => load(feed.url)
      .then(parsed => ({ ...feed, content: _.union(feed.content, parsed.content) }))
      .then(updated => ({ [feed.uid]: updated }))
      .catch((error) => {
        console.log(error);
        return undefined;
      }));
  Promise.all(updatingTasks)
    .then((updatedFeeds) => {
      const updatedData = updatedFeeds
        .filter(item => item !== undefined)
        .reduce((acc, feed) => ({ ...acc, ...feed }), {});
      setState(state, 'feeds.byUID', { ...feeds.byUID, ...updatedData });
    })
    .catch((error) => {
      console.log(error);
    })
    .then(() => setTimeout(() => updateFeeds(state), 5000));
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
    .addEventListener('click', () => resetFeedDetail(state));
  document
    .getElementById('closeFeedDetailHeaderButton')
    .addEventListener('click', () => resetFeedDetail(state));
  setTimeout(() => updateFeeds(state), 5000);
};

export default enable;
export { showFeedDetail };

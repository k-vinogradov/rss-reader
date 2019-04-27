import _ from 'lodash';
import isURL from 'validator/lib/isURL';
import load from './loader';

const resetFormState = (state) => {
  state.formState = { state: 'init', value: '' };
};

const handleFormInput = ({ target }, state) => {
  const isValid = (value) => {
    const { feeds } = state;
    return isURL(value) && !feeds.allUIDs.map(uid => feeds.byUID[uid].url).includes(value);
  };

  const newState = (value) => {
    if (value.length === 0) return 'init';
    return isValid(value) ? 'valid' : 'invalid';
  };

  const { value } = target;
  state.formState = { state: newState(value), value };
};

const loadFeed = (feeds, uid) => {
  const feed = feeds.byUID[uid];
  console.log(`Controller tries to load feed ${feed.url}`);
  load(feed.url)
    .then((parsed) => {
      console.log('Store parsed feed data to the state');
      feeds.byUID = {
        ...feeds.byUID,
        [uid]: { ...feed, ...parsed, status: 'complete' },
      };
    })
    .catch((error) => {
      console.log(error);
      setTimeout(() => loadFeed(feeds, uid), 10000);
    });
};

const handleFormSubmit = (event, state) => {
  event.preventDefault();
  if (state.formState.state !== 'valid') return;
  const uid = _.uniqueId();
  const url = state.formState.value;
  state.feeds.allUIDs.push(uid);
  state.feeds.byUID[uid] = { uid, url, status: 'new' };
  resetFormState(state);
  loadFeed(state.feeds, uid);
};

const showFeedDetail = (state, title, description) => {
  console.log(state);
  state.feedDetailToShow = { title, description };
};

const resetFeedDetail = (state) => {
  state.feedDetailToShow = null;
};

const enable = (state) => {
  document
    .getElementById('addFeedForm')
    .addEventListener('submit', event => handleFormSubmit(event, state));
  document
    .getElementById('addFeedInput')
    .addEventListener('input', event => handleFormInput(event, state));
  document.getElementById('closeFeedDetailButton').addEventListener('click', () => resetFeedDetail(state));
  document
    .getElementById('closeFeedDetailHeaderButton')
    .addEventListener('click', () => resetFeedDetail(state));
};

export default enable;
export { showFeedDetail };

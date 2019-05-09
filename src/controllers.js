import _ from 'lodash';
import isURL from 'validator/lib/isURL';
import load from './loader';

const listUpdateInterval = 5000;

const getFormState = (url, currentURLs) => {
  if (!url) return 'init';
  return isURL(url) && !currentURLs.includes(url) ? 'valid' : 'invalid';
};

const handleFormInput = ({ target: { value } }, { form, feeds: { allURLs } }) => {
  form.value = value;
  form.state = getFormState(value, allURLs);
};

const handleFormSubmit = (event, state) => {
  event.preventDefault();
  const { feeds, form } = state;
  if (form.state !== 'valid') return;
  state.loading = true;
  const url = form.value;
  load(url)
    .then((feed) => {
      feeds.allURLs.push(url);
      feeds.byURL[url] = feed;
      state.form = { state: 'init', value: '' };
      state.error = null;
    })
    .catch((error) => {
      state.error = { url, reason: error.message };
    })
    .finally(() => {
      state.loading = false;
    });
};

const updateFeeds = (state) => {
  const { feeds } = state;
  const tasks = feeds.allURLs.map(url => load(url).catch(() => {}));
  Promise.all(tasks).then(async (loaded) => {
    let updated = false;
    loaded
      .filter(item => item !== undefined)
      .forEach(({ url, content }) => {
        const newContent = _.unionWith(feeds.byURL[url].content, content, _.isEqual);
        if (!_.isEqual(feeds.byURL[url].content, newContent)) {
          feeds.byURL[url].content = newContent;
          updated = true;
        }
      });
    /*
      Because of Watch.JS issue (https://github.com/melanke/Watch.JS/issues/129)
      we have to recreate byURL attribute to invoke the render
    */
    if (updated) {
      feeds.byURL = { ...feeds.byURL };
    }
    setTimeout(() => updateFeeds(state), listUpdateInterval);
  });
};

const showDetail = (detail, state) => {
  state.detail = detail;
};

const hideDetail = (state) => {
  state.detail = null;
};

const enable = (state) => {
  [
    ['addFeedForm', 'submit', event => handleFormSubmit(event, state)],
    ['addFeedInput', 'input', event => handleFormInput(event, state)],
    ['closeFeedDetailButton', 'click', () => hideDetail(state)],
    ['closeFeedDetailHeaderButton', 'click', () => hideDetail(state)],
  ].forEach(([id, event, func]) => document.getElementById(id).addEventListener(event, func));
  setTimeout(() => updateFeeds(state), listUpdateInterval);
};

export default enable;
export { showDetail };

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

  form.state = 'loading';

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
      form.state = 'valid';
    });
};

const updateFeeds = (state) => {
  const { feeds } = state;

  const tasks = feeds.allURLs.map(url => load(url).catch(() => {}));

  Promise.all(tasks).then((loaded) => {
    // TODO: `data` is a bad name, replace with something meaningful
    const data = { ...feeds.byURL };
    loaded
      .filter(item => item !== undefined)
      .forEach(({ url, content }) => {
        data[url].content = _.unionWith(data[url].content, content, _.isEqual);
      });

    if (!_.isEqual(feeds.byURL, data)) feeds.byURL = data;
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

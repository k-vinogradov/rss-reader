import _ from 'lodash';
import isURL from 'validator/lib/isURL';

const resetFormState = (state) => {
  state.formState = { state: 'init', value: '' };
};

const handleFormInput = ({ target }, state) => {
  const isValid = value => isURL(value) && !state.feeds.map(({ url }) => url).includes(value);

  const newState = (value) => {
    if (value.length === 0) return 'init';
    return isValid(value) ? 'valid' : 'invalid';
  };
  const { value } = target;
  state.formState = { state: newState(value), value };
};

const handleFormSubmit = (event, state) => {
  event.preventDefault();
  if (state.formState.state !== 'valid') return;
  const uid = _.uniqueId();
  const url = state.formState.value;
  state.feeds.push({ uid, url, state: 'new' });
  resetFormState(state);
};

const enable = (state) => {
  document
    .getElementById('add-feed-form')
    .addEventListener('submit', event => handleFormSubmit(event, state));
  document
    .getElementById('feed-url-input')
    .addEventListener('input', event => handleFormInput(event, state));
};

export default enable;

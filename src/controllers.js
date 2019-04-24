import isURL from 'validator/lib/isURL';

const handleFormInput = ({ target }, state) => {
  const { value } = target;
  state.formIsValid = isURL(value) && !state.feedURLs.includes(value);
  state.formValue = value;
};

const handleFormSubmit = (event, state) => {
  event.preventDefault();
  if (!state.formIsValid) return;
  state.feedURLs.push(state.formValue);
  state.formValue = '';
  state.formState = 'invalid';
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

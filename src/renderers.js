import WatchJS from 'melanke-watchjs';

const renderForm = (state) => {
  const input = document.getElementById('feed-url-input');
  const button = document.getElementById('add-feed-button');

  const formRenderersMap = {
    init: () => {
      input.classList.remove('is-invalid');
      input.value = '';
      button.disabled = true;
    },
    invalid: () => {
      input.classList.add('is-invalid');
      input.value = state.formState.value;
      button.disabled = true;
    },
    valid: () => {
      input.classList.remove('is-invalid');
      input.value = state.formState.value;
      button.disabled = false;
    },
  };

  formRenderersMap[state.formState.state]();
};

const renderFeeds = (state) => {
  state.feeds.forEach(({ uid, url }) => console.log(`${uid} : ${url}`));
};

const enable = (state) => {
  WatchJS.watch(state, 'formState', () => renderForm(state));
  WatchJS.watch(state, 'feeds', () => renderFeeds(state));
  renderForm(state);
};

export default enable;

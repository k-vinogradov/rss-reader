import WatchJS from 'melanke-watchjs';

const renderForm = (state) => {
  const renderInvalidForm = () => {
    const input = document.getElementById('feed-url-input');
    if (state.formValue.length === 0) input.classList.remove('is-invalid');
    else input.classList.add('is-invalid');
    document.getElementById('add-feed-button').disabled = true;
  };

  const renderValidForm = () => {
    document.getElementById('feed-url-input').classList.remove('is-invalid');
    document.getElementById('add-feed-button').disabled = false;
  };

  (state.formIsValid ? renderValidForm : renderInvalidForm)();
};

const enable = (state) => {
  WatchJS.watch(state, ['formIsValid', 'formValue'], () => renderForm(state));
  renderForm(state);
};

export default enable;

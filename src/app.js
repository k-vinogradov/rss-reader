import enableRenderers from './renderers';
import enableControllers from './controllers';

const app = () => {
  const state = {
    addUrlFormState: {
      state: 'init',
      formValue: '',
    },
    feedEditFormState: {
      state: 'valid',
      formValue: '',
      uid: '',
    },
    feeds: {
      allUIDs: [],
      byUID: {},
    },
    feedDetailToShow: null,
    showFeedEditForm: false,
  };

  enableRenderers(state);
  enableControllers(state);
};

export default app;

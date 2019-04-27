import enableRenderers from './renderers';
import enableControllers from './controllers';

const app = () => {
  const state = {
    formState: {
      state: 'init',
      formValue: '',
    },
    feeds: {
      allUIDs: [],
      byUID: {},
    },
    feedDetailToShow: null,
  };

  enableRenderers(state);
  enableControllers(state);
};

export default app;

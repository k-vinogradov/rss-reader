import enableRenderers from './renderers';
import enableControllers from './controllers';

const app = () => {
  const state = {
    formState: {
      state: 'init',
      formValue: '',
    },
    feeds: [],
  };

  enableRenderers(state);
  enableControllers(state);
};

export default app;

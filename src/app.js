import enableRenderers from './renderers';
import enableControllers from './controllers';

const app = () => {
  const state = {
    formIsValid: false,
    formValue: '',
    feedURLs: [],
  };

  enableRenderers(state);
  enableControllers(state);
};

export default app;

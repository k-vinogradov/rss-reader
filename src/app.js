import enableRenderers from './renderers';
import enableControllers from './controllers';

const app = () => {
  const state = {
    form: { state: 'init', value: '' },
    feeds: { allURLs: [], byURL: {} },
    error: null,
    detail: null,
    loading: false,
  };

  enableRenderers(state);
  enableControllers(state);
};

export default app;

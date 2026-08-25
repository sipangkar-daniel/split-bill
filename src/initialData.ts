import type {AppState} from './types';

export const INITIAL_DATA: AppState = (() => {

  return {
    people: [],
    bills: [],
  };
})();

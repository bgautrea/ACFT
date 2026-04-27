import { EVENT_CODES, type Action, type EventCode, type RawScores, type State } from './types';

const emptyRaw: RawScores = EVENT_CODES.reduce((acc, code) => {
  acc[code] = '';
  return acc;
}, {} as RawScores);

export const initialState: State = {
  age: 22,
  sex: 'M',
  raw: { ...emptyRaw },
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'set-age':
      return { ...state, age: action.age };
    case 'set-sex':
      return { ...state, sex: action.sex };
    case 'set-raw':
      return { ...state, raw: { ...state.raw, [action.event satisfies EventCode]: action.value } };
    case 'reset':
      return { ...initialState, raw: { ...emptyRaw } };
  }
}

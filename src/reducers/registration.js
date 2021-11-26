import Config from 'config';
import Storage from 'storage';
import Immutable from 'immutable';

/** ********************************************
 ** Constants                                **
 ******************************************** */

const REGISTER_SUCCESS = Symbol();
const REGISTER_ERR = Symbol();
const REGISTER_DONE = Symbol();

const defaultState = Immutable.fromJS({
  user: {},
  registered: false,
  registerSuccess: false,
  error: null,
});

/** ********************************************
 ** Registration States                      **
 ******************************************** */

class State {
  static Register(error, user) {
    return {
      type: error ? REGISTER_ERR : REGISTER_SUCCESS,
      user: error ? undefined : user,
      error: error || undefined,
    };
  }
}

/** ********************************************
 ** Actions                                  **
 ******************************************** */

const RegisterUser = info => async (dispatch) => {
  try {
    const response = await fetch(Config.API_URL + Config.routes.auth.register, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Storage.get('token')}`,
      },
      body: JSON.stringify({ info }),
    });

    const data = await response.json();

    if (!data) throw new Error('Empty response from server');
    if (data.error) throw new Error(data.error.message);

    dispatch(State.Register(null, data.user));
  } catch (err) {
    dispatch(State.Register(err.message));
  }
};

/** ********************************************
 ** Registration Reducer                     **
 ******************************************** */

const Registration = (state = defaultState, action) => {
  switch (action.type) {
    case REGISTER_SUCCESS:
      return state.withMutations((val) => {
        val.set('user', action.user);
        val.set('error', null);
        val.set('registered', true);
        val.set('registerSuccess', true);
      });

    case REGISTER_ERR:
      return state.withMutations((val) => {
        val.set('error', action.error);
        val.set('registered', true);
        val.set('registerSuccess', false);
      });

    case REGISTER_DONE:
      return state.withMutations((val) => {
        val.set('registered', false);
      });

    default:
      return state;
  }
};

const registerDone = () => ({ type: REGISTER_DONE });
export {
  Registration, RegisterUser, registerDone,
};
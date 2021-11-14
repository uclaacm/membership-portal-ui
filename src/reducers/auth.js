import Config from 'config';
import Storage from 'storage';
import Immutable from 'immutable';

import { replace } from 'react-router-redux';

/** ********************************************
 ** Constants                                **
 ******************************************** */

const AUTH_USER = Symbol();
const UNAUTH_USER = Symbol();
const AUTH_ERROR = Symbol();

const initState = () => {
  const token = Storage.get('token');
  return Immutable.fromJS({
    error: null,
    timestamp: null,
    authenticated: !!token,
    isAdmin: !!token && tokenIsAdmin(token),
  });
};

/** ********************************************
 ** Helper Functions                         **
 ******************************************** */

const tokenGetClaims = (token) => {
  if (!token) {
    return {};
  }
  const tokenArray = token.split('.');
  if (tokenArray.length !== 3) {
    return {};
  }
  return JSON.parse(window.atob(tokenArray[1].replace('-', '+').replace('_', '/')));
};

const tokenIsAdmin = token => !!tokenGetClaims(token).admin;

/** ********************************************
 ** Auth States                              **
 ******************************************** */

class State {
  static Auth(error, token) {
    return {
      type: error ? AUTH_ERROR : AUTH_USER,
      isAdmin: error ? undefined : tokenIsAdmin(token),
      error: error || undefined,
    };
  }

  static UnAuth(error) {
    return {
      type: UNAUTH_USER,
    };
  }
}

/** ********************************************
 ** Actions                                  **
 ******************************************** */

const LoginUser = (tokenId) => async (dispatch) => {
  try {
    const response = await fetch(Config.API_URL + Config.routes.auth.login, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 'tokenId': tokenId }),
    });

    const status = await response.status;
    const data = await response.json();

    if (!data) throw new Error('Empty response from server');
    if (data.error) throw new Error(data.error.message);

    Storage.set('token', data.token);
    console.log(data)
    dispatch(State.Auth(null, data.token));
  } catch (err) {
    dispatch(State.Auth(err.message));
  }
};

const LogoutUser = error => async (dispatch) => {
  dispatch(State.UnAuth());
  Storage.remove('token');
  dispatch(replace('/login'));
};

/** ********************************************
 ** Auth Reducer                             **
 ******************************************** */

const Auth = (state = initState(), action) => {
  switch (action.type) {
    case AUTH_USER:
      return state.withMutations((val) => {
        val.set('error', null);
        val.set('timestamp', Date.now());
        val.set('authenticated', true);
        val.set('isAdmin', action.isAdmin);
      });

    case UNAUTH_USER:
      return state.withMutations((val) => {
        val.set('authenticated', false);
        val.set('isAdmin', false);
      });

    case AUTH_ERROR:
      return state.withMutations((val) => {
        val.set('error', action.error);
        val.set('timestamp', Date.now());
      });

    default:
      return state;
  }
};

export {
  Auth, LoginUser, LogoutUser
};

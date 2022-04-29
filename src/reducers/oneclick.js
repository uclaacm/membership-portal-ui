import Config from "config";
import Immutable from "immutable";
import Storage from "storage";

/***********************************************
 ** Constants                                 **
 ***********************************************/

 const RESET_ONECLICK_PASSWORD_SUCCESS = Symbol();
 const RESET_ONE_CLICK_PASSWORD_ERROR = Symbol();
 const RESET_ONECLICK_PASSWORD_DONE = Symbol(); 

const defaultState = Immutable.fromJS({
  passwordUpdated: false,
  error: null,
});

/***********************************************
 ** OneClick States                           **
 ***********************************************/

class State {
  static Auth(error, token) {
    return {
      type: error ? AUTH_ERROR : AUTH_USER,
      isAdmin: error ? undefined : tokenIsAdmin(token),
      isSuperAdmin: error ? undefined : tokenIsSuperAdmin(token),
      isRegistered: error ? undefined : tokenIsRegistered(token),
      error: error || undefined,
    };
  }

  static UnAuth(error) {
    return {
      type: UNAUTH_USER,
    };
  }
}

/***********************************************
 ** Actions                                   **
 ***********************************************/

const ChangeOneClickPassword = (oldPassword, newPassword) => async dispatch => {
  try {
    const response = await fetch(Config.API_URL + Config.routes.auth.oneclick, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${Storage.get("token")}`,
      },
      body: JSON.stringify({ oldPassword: oldPassword, newPassword: newPassword }),
    });

    const data = await response.json();

    if (!data) throw new Error("Empty response from server");
    if (data.error) throw new Error(data.error.message);

  } catch (err) {
  }
};

/***********************************************
 ** OneClick Reducer                          **
 ***********************************************/

const OneClick = (state = defaultState, action) => {
  switch (action.type) {
    case AUTH_USER:
      return state.withMutations(val => {
        val.set("error", null);
        val.set("timestamp", Date.now());
        val.set("authenticated", true);
        val.set("isRegistered", action.isRegistered);
        val.set("isAdmin", action.isAdmin);
        val.set("isSuperAdmin", action.isSuperAdmin);
      });

    case UNAUTH_USER:
      return state.withMutations(val => {
        val.set("authenticated", false);
        val.set("isRegistered", false);
        val.set("isAdmin", false);
        val.set("isSuperAdmin", false);
      });

    case AUTH_ERROR:
      return state.withMutations(val => {
        val.set("error", action.error);
        val.set("timestamp", Date.now());
      });

    default:
      return state;
  }
};

export { OneClick, ChangeOneClickPassword };
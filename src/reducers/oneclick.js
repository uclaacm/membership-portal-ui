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
  passwordChanged: false,
  error: null,
});

/***********************************************
 ** OneClick States                           **
 ***********************************************/

class State {
  static ChangeOneClickPassword(error) {
    return {
      type: error ? RESET_ONE_CLICK_PASSWORD_ERROR : RESET_ONECLICK_PASSWORD_SUCCESS,
      error: error || undefined,
    }
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

    dispatch(State.ChangeOneClickPassword());
  } catch (err) {
    dispatch(State.ChangeOneClickPassword(err));
  }
};

/***********************************************
 ** OneClick Reducer                          **
 ***********************************************/

const OneClick = (state = defaultState, action) => {
  switch (action.type) {
    case RESET_ONECLICK_PASSWORD_SUCCESS:
      return state.withMutations(val => {
        val.set("error", null);
        val.set("passwordChanged", true);
      });

    case RESET_ONE_CLICK_PASSWORD_ERROR:
      return state.withMutations(val => {
        val.set("error", action.error);
        val.set("passwordChanged", false); // should this be true? https://github.com/uclaacm/membership-portal-ui/blob/e4eb1d217d6be49c47fbbb61f35b390ce6bb6fc8/src/reducers/auth.js#L215
      });

    case RESET_ONECLICK_PASSWORD_DONE:
      return state.withMutations(val => {
        val.set("error", null);
        val.set("passwordChanged", false);
      });

    default:
      return state;
  }
};

const ChangeOneClickPasswordDone = () => ({ type: RESET_ONECLICK_PASSWORD_DONE });

export { OneClick, ChangeOneClickPassword, ChangeOneClickPasswordDone };
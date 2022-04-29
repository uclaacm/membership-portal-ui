import Config from "config";
import Immutable from "immutable";
import Storage from "storage";

import { LogoutUser } from "./auth";

/***********************************************
 ** Constants                                 **
 ***********************************************/

const FETCH_ADMINS = Symbol();
const FETCH_ADMINS_ERROR = Symbol();
const DELETE_ADMIN_ERROR = Symbol();
const DELETE_ADMIN_SUCCESS = Symbol();
const ADD_ADMIN_SUCCESS = Symbol();
const ADD_ADMIN_ERROR = Symbol();
const ADD_ADMIN_DONE = Symbol();

const defaultState = Immutable.fromJS({
  admins: [],
  adminAdded: false,
  adminDeleted: false,
  adminAddSuccess: false,
  adminDeleteSuccess: false,
  error: null,
});

/***********************************************
 ** Admins States                             **
 ***********************************************/

class State {
  static FetchAdmins(error, admins) {
    return {
      type: error ? FETCH_ADMINS_ERROR : FETCH_ADMINS,
      admins: error ? undefined : admins,
      error: error || undefined,
    };
  }

  static AddAdmin(error) {
    return {
      type: error ? ADD_ADMIN_ERROR : ADD_ADMIN_SUCCESS,
      error: error || undefined,
    };
  }

  static UpdateAdmin(error) {
    return {
      type: error ? UPDATE_ADMIN_ERROR : UPDATE_ADMIN_SUCCESS,
      error: error || undefined,
    };
  }

  static DeleteAdmin(error) {
    return {
      type: error ? DELETE_ADMIN_ERROR : DELETE_ADMIN_SUCCESS,
      error: error || undefined,
    };
  }
}

/***********************************************
 ** Actions                                   **
 ***********************************************/

const FetchAdmins = () => async dispatch => {
  try {
    const response = await fetch(Config.API_URL + Config.routes.user.admins, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${Storage.get("token")}`,
      },
    });

    const status = await response.status;
    if (status === 401 || status === 403) {
      return dispatch(LogoutUser());
    }

    const data = await response.json();
    if (!data) throw new Error("Empty response from server");
    if (data.error) throw new Error(data.error.message);

    const order = ["SUPERADMIN", "ADMIN"];
    const admins = data.admins.sort(function (a, b) {
      return order.indexOf(a.accessType) - order.indexOf(b.accessType);
    });

    dispatch(State.FetchAdmins(null, admins));
  } catch (err) {
    dispatch(State.FetchAdmins(err.message));
  }
};

const AddAdmin = email => async dispatch => {
  try {
    const response = await fetch(Config.API_URL + Config.routes.user.admins, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${Storage.get("token")}`,
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!data) throw new Error("Empty response from server");
    if (data.error) throw new Error(data.error.message);

  } catch (err) {
  }
};

const DeleteAdmin = email => async dispatch => {
  try {
    const response = await fetch(Config.API_URL + Config.routes.user.admins, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${Storage.get("token")}`,
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!data) throw new Error("Empty response from server");
    if (data.error) throw new Error(data.error.message);

  } catch (err) {
  }
};

const ChangeSuperAdmin = email => async dispatch => {
  try {
    const response = await fetch(Config.API_URL + Config.routes.user.admins, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${Storage.get("token")}`,
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!data) throw new Error("Empty response from server");
    if (data.error) throw new Error(data.error.message);

  } catch (err) {
  }
};

/***********************************************
 ** Admins Reducer                            **
 ***********************************************/

const Admins = (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_USER:
      return state.withMutations(val => {
        val.set("error", null);
        val.set("profile", action.user);
        val.set("fetchSuccess", true);
      });

    case FETCH_USER_ERR:
      return state.withMutations(val => {
        val.set("error", action.error);
        val.set("profile", {});
        val.set("fetchSuccess", false);
      });

    case UPDATE_USER_ERR:
      return state.withMutations(val => {
        val.set("error", action.error);
        val.set("updated", true);
        val.set("updateSuccess", false);
      });

    case UPDATE_USER_SUCCESS:
      return state.withMutations(val => {
        val.set("error", null);
        val.set("updated", true);
        val.set("updateSuccess", true);
      });

    case UPDATE_COMPLETED:
      return state.withMutations(val => {
        val.set("updated", false);
      });

    case FETCH_ADMINS:
      return state.withMutations(val => {
        val.set("admins", action.admins);
      });

    default:
      return state;
  }
};

const UserUpdateDone = () => ({ type: UPDATE_COMPLETED });

export { Admins, UserUpdateDone, AddAdmin, DeleteAdmin, FetchAdmins, ChangeSuperAdmin };

import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { createBrowserHistory } from "history";
import { routerReducer, routerMiddleware } from "react-router-redux";
import thunk from "redux-thunk";

import { User, FetchUser, UpdateUser, UserUpdateDone, FetchActivity } from "./user";
import { Admins, FetchAdmins, AddAdmin, DeleteAdmin, ChangeSuperAdmin, AddAdminDone, PromoteAdminDone } from "./admins";
import { Auth, LoginUser, LogoutUser, RefreshToken } from "./auth";
import { OneClick, ChangeOneClickPassword } from "./oneclick";
import {
  Events,
  GetCurrentEvents,
  PostNewEvent,
  UpdateEvent,
  DeleteEvent,
  UpdateEventDone,
  CreateEventDone,
} from "./events";
import { Leaderboard, FetchLeaderboard, InvalidateLeaderboard } from "./leaderboard";
import { CheckIn, CheckInto, ResetCheckIn } from "./checkin";
import { Registration, RegisterUser, registerDone } from "./registration";

const history = createBrowserHistory();
const routing = routerMiddleware(history);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  combineReducers({
    Auth,
    OneClick,
    Events,
    User,
    Admins,
    Leaderboard,
    CheckIn,
    Registration,
    router: routerReducer,
  }),
  composeEnhancers(applyMiddleware(routing, thunk))
);

const Action = {
  LoginUser,
  LogoutUser,
  RefreshToken,
  ChangeOneClickPassword,
  FetchUser,
  UpdateUser,
  UserUpdateDone,
  FetchActivity,
  AddAdmin,
  DeleteAdmin,
  ChangeSuperAdmin,
  AddAdminDone, 
  PromoteAdminDone,
  FetchAdmins,
  GetCurrentEvents,
  PostNewEvent,
  UpdateEvent,
  DeleteEvent,
  CreateEventDone,
  UpdateEventDone,
  FetchLeaderboard,
  InvalidateLeaderboard,
  RegisterUser,
  registerDone,
  CheckInto,
  ResetCheckIn,
};

export { store, history, Action };

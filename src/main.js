import 'main.scss';

import React from 'react';
import { Provider } from 'react-redux';
import { Route, Switch, Redirect } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';

import { store, history } from 'reducers';

import Events from 'containers/events';
import Login from 'containers/login';
import Profile from 'containers/profile';
import Leaderboard from 'containers/leaderboard';
import ControlPanel from 'containers/controlPanel';
import Resources from 'containers/resources';
import Register from 'containers/register';
import ResetPassword from 'containers/resetPassword';
import requireAuth from 'containers/requireAuth';


class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <ConnectedRouter onUpdate={() => window.scrollTo(0, 0)} history={history}>
          <div>
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/resetpassword" component={ResetPassword} />
              <Route path="/events" component={requireAuth(Events)} />
              <Route path="/profile" component={requireAuth(Profile)} />
              <Route path="/resources" component={requireAuth(Resources)} />
              <Route path="/leaderboard" component={requireAuth(Leaderboard)} />
              <Route path="/controlpanel" component={requireAuth(ControlPanel)} />
              <Redirect to="/events" />
            </Switch>
          </div>
        </ConnectedRouter>
      </Provider>
    );
  }
}

export default App;

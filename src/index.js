import React from 'react';
import ReactDOM from 'react-dom';
import {
    Redirect,
    Route,
    BrowserRouter as Router,
    Switch
} from "react-router-dom";
import auth from './auth.ts';
import './index.css';
import LoginPage from './login_page.js';
import NotFound from './not_found.js';
import PageContent from './page_content.js';
import { Game } from './tictactoe/game.js';
import TodoList from './todo_list/todo_list.js';

function PrivateRoute({ children, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth.isAuthenticated() ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}

export default function App() {
  const TodoListPage = (
      <PageContent>
          <TodoList />
      </PageContent>
  );

  const GamePage = (
    <PageContent>
      <Game />
    </PageContent>
  );

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <LoginPage />
        </Route>
        <Route exact path="/login">
          <LoginPage />
        </Route>
        <PrivateRoute path="/home">
          <PageContent>
            <h2>Home Page</h2>
          </PageContent>
        </PrivateRoute>
        <PrivateRoute path="/todos">
          {TodoListPage }
        </PrivateRoute>
        <PrivateRoute path="/game">
          {GamePage }
        </PrivateRoute>
        <Route path="*">
          <PageContent>
            <NotFound />
          </PageContent>
        </Route>
      </Switch>
    </Router>
  );
}

// ========================================

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

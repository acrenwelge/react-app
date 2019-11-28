import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import TodoList from './todo_list.js';
import { Game } from './game.js';
import PageContent from './page_content.js';
import NotFound from './not_found.js';
import './index.css';

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
          <PageContent>
            <h2>Home Page</h2>
          </PageContent>
        </Route>
        <Route path="/todos">
          {TodoListPage }
        </Route>
        <Route path="/game">
          {GamePage }
        </Route>
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

import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { TodoList } from './todo_list.js';
import { Game } from './game.js';
import PageContent from './page_content.js';
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
          {TodoListPage }
        </Route>
        <Route path="/todos">
          {TodoListPage }
        </Route>
        <Route path="/game">
          {GamePage }
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

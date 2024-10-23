import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
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
import { Game } from './tictactoe/game';
import TodoItemDetail from './todo_list/todo_item_detail';
import TodoList from './todo_list/todo_list';

const theme = createTheme({
  palette: {
    primary: {
      main: "#2196f3",
    },
    secondary: {
      main: '#f44336',
    },
  },
});


function PrivateRoute({ children, ...rest }) {
  console.log('PrivateRoute => authenticated? ', auth.isAuthenticated());
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
        <PrivateRoute path="/todos/:id" component={TodoItemDetail} />
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
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </LocalizationProvider>,
  document.getElementById('root')
);

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
import auth from './auth';
import './index.css';
import LoginPage from './LoginPage';
import NotFound from './NotFound';
import PageContent from './PageContent';
import Settings from './Settings';
import { colorThemeOptions, typographyThemeOptions } from './themeOptions';
import Game from './tictactoe/Game';
import Leaderboard from './tictactoe/Leaderboard';
import TodoItemDetail from './todo_list/TodoItemDetail';
import TodoListContainer from './todo_list/TodoListContainer';


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
  const [palette, setPalette] = React.useState('dark');
  const [fontSize, setFontSize] = React.useState('normal');
  
  const theme = createTheme({
    palette: colorThemeOptions[palette],
    typography: typographyThemeOptions[fontSize],
  });

  console.log('palette: ', palette);

  const PageWrapper = (props) => {
    return (
    <ThemeProvider theme={theme}>
      <PageContent>
        {props.children}
      </PageContent>
    </ThemeProvider>
    )
  };

  const TodoListPage = (
    <PageWrapper>
      <TodoListContainer />
    </PageWrapper>
  );

  const GamePage = (
    <PageWrapper>
      <Game />
    </PageWrapper>
  );

  const LeaderboardPage = (
    <PageWrapper>
      <Leaderboard />
    </PageWrapper>
  );

  const SettingsPage = (
    <PageWrapper>
      <Settings fontSize={fontSize} palette={palette} onFontSizeChange={setFontSize} onPaletteChange={setPalette}/>
    </PageWrapper>
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
          <PageWrapper>
            <h2>Home Page</h2>
          </PageWrapper>
        </PrivateRoute>
        <PrivateRoute path="/todos">
          {TodoListPage }
        </PrivateRoute>
        <PrivateRoute path="/todos/:id" component={TodoItemDetail} />
        <PrivateRoute path="/game">
          {GamePage }
        </PrivateRoute>
        <Route exact path="/leaderboard">
          {LeaderboardPage }
        </Route>
        <Route exact path="/settings">
          {SettingsPage }
        </Route>
        <Route path="*">
          <PageWrapper>
            <NotFound />
          </PageWrapper>
        </Route>
      </Switch>
    </Router>
  );
}

// ========================================

ReactDOM.render(
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <App />
  </LocalizationProvider>,
  document.getElementById('root')
);

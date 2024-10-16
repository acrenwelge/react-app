import React, { useState } from 'react';
import { Redirect } from 'react-router';
import auth from './auth.ts';

export default function LoginPage(props) {
  let [doRedirect, updateDoRedirect] = useState(false);

  let attemptLogin = (e) => {
    const uname = document.getElementById('username-field').value;
    const pw = document.getElementById('password-field').value;
    const loggedIn = auth.checkCreds(uname, pw);
    localStorage.setItem('credentials', JSON.stringify({username: uname, pw: pw}));
    if (loggedIn) {
      updateDoRedirect(true);
    } else {
      alert('INVALID LOGIN CREDENTIALS');
    }
  }
  
  let username, pw;
  try {
    const creds = JSON.parse(localStorage.getItem('credentials'));
    username = creds.username;
    pw = creds.pw;
  } catch (e) {
    console.warn('No credentials found');
  }
  if ((username && auth.checkCreds(username, pw)) || doRedirect) {
    return <Redirect to="/home" />
  }

  return (
    <div>
      <form id="login-form">
        Username: <input type="username" id="username-field" required />
        Password: <input type="password" id="password-field" required minLength="10"/>
        <input type="button" id="login-button" value="Login" onClick={attemptLogin}/>
      </form>
    </div>
  )
}

import React, { useState } from 'react';
import { Redirect } from 'react-router';
import auth from './auth.ts';

export default function LoginPage(props) {
  let [doRedirect, updateDoRedirect] = useState(false);

  let attemptLogin = (e) => {
    const uname = document.getElementById('username-field').value;
    const pw = document.getElementById('password-field').value;
    let loggedIn = auth.checkCreds(uname, pw);
    if (loggedIn) {
      updateDoRedirect(true);
    } else {
      alert('INVALID LOGIN CREDENTIALS');
    }
  }

  if (doRedirect) {
    return <Redirect to="/home" />
  }

  return (
    <div>
      <form id="login-form">
        Username: <input type="username" id="username-field" required />
        Password: <input type="password" id="password-field" required minLength="10"/>
        <input type="button" value="Login" onClick={attemptLogin}/>
      </form>
    </div>
  )
}

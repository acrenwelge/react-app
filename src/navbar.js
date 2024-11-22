import React from "react";
import {
  Link
} from "react-router-dom";
import Clock from './clock.js';

export default function Navbar() {
  const centered = {
    margin: 'auto',
    width: '100%',
    textAlign: 'center',
  };

  return (
    <header style={centered}>
      <div>
        Andrew's React App
      </div>
      <div style={{marginRight: "20%"}}>
        <ul>
          <li>
            <Link to="/home">Home</Link>
          </li>
          <li>
            <Link to="/game">Game</Link>
          </li>
          <li>
            <Link to="/todos" data-testid="todos-page-link">Todos</Link>
          </li>
          <li>
            <Link to="/settings">Settings</Link>
          </li>
          <li>
            <Link to="/login">Logout</Link>
          </li>
        </ul>
      </div>
      <div>
        <Clock />
      </div>
    </header>
  )
}

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
      <div>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/game">Game</Link>
          </li>
          <li>
            <Link to="/todos">Todos</Link>
          </li>
        </ul>
      </div>
      <Clock />
    </header>
  )
}

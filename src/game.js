import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import Board from './board.js';

function GameForm(props) {
  return (
    <form onSubmit={props.startGame} >
      <TextField
        name="p1"
        label="Player 1 Name"
        margin="normal"
        fullWidth
        onChange={props.handleFormChange}
      />
      <TextField
        name="p2"
        label="Player 2 Name"
        margin="normal"
        fullWidth
        onChange={props.handleFormChange}
      />
    <FormGroup row>
      <FormControlLabel
        control={
          <Checkbox checked={props.p1IsX} onChange={props.toggleXOrO} />
        }
        label="Player 1 is X"
        color="secondary"
      />
    </FormGroup>
    <FormGroup row>
      <Button
        type="submit" variant="contained"
        color="primary" id="game-form-submit">
        Start!
      </Button>
    </FormGroup>
    </form>
  );
}

function Game(props) {
  const [history, setHistory] = useState([
    {
      squares: Array(9).fill(null),
      move: [],
    }]);
  const [stepNumber, setStepNumber] = useState(0);
  const [players, setPlayers] = useState({p1: null, p2: null});
  const [p1IsX, setP1IsX] = useState(true);
  const [xIsNext, setXIsNext] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setGameStarted(true);
    if (!p1IsX) {
      setXIsNext(false);
    }
  }

  const restart = (e) => {
    setGameStarted(false);
    setHistory([{
      squares: Array(9).fill(null),
      move: [],
    }]);
    setStepNumber(0);
    setXIsNext(p1IsX ? true : false);
  }

  // converting index of the square to [x,y] coordinates on the tic-tac-toe board
  const convertToCoords = (i) => {
    let x = i % 3;
    let y = Math.floor(i/3);
    return [x,y];
  }

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return {
          winner: squares[a],
          winSquares: [a, b, c]
        }
      }
    }
    if (!squares.includes(null)) {
      return {
        winner: null // draw!
      }
    }
    return null;
  }

  const handleClick = (i) => {
    const current = history[stepNumber];
    const squares = current.squares.slice();
    const [x,y] = convertToCoords(i);
    if (calculateWinner(squares) != null || squares[i]) {
      return;
    }
    squares[i] = xIsNext ? 'X' : 'O';
    setHistory((history, props) => {
        return history.concat(
          {
            squares: squares,
            move: [x, y],
          });
    });
    setStepNumber(history.length);
    setXIsNext(prev => !prev);
  }

  const jumpTo = (step) => {
    setStepNumber(step);
    setHistory(history => history.slice(0, step + 1));
    setXIsNext((old) => {
      if (p1IsX) return (step % 2) === 0;
      else return (step % 2) !== 0;
    });
  }

  const sortHistoryOrder = () => {
    setHistory(history => {
      let newOrder = history.slice(0, history.length);
      newOrder.reverse();
      return newOrder;
    });
  }

  const handleFormChange = (e) => {
    e.persist();
    setPlayers((oldPlayers) => {
      let newPlayer = {[e.target.name]: e.target.value};
      return {
        ...oldPlayers,
        ...newPlayer
    }});
  }

  const toggleXOrO = (e) => {
    setP1IsX(old => !old);
  }

  const current = history[history.length-1];
  const win = calculateWinner(current.squares);

  let status;
  if (win && win.winner != null) {
    status = `The winner is ${win.winner}`;
  } else if (win && win.winner == null) {
    status = "The game is a draw!";
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }

  const moves = history.map((step, move) => {
    const [x,y] = step.move;
    const desc = move ?
      `Go to move # ${move} (${x},${y})` :
      'Go to game start';
    const last = move === history.length - 1;
    if (!last) {
      return (
        <li key={move}>
          <Button onClick={() => jumpTo(move)}>{desc}</Button>
        </li>
      );
    } else {
      return (
        <li key={move}>
          <Button onClick={() => jumpTo(move)}><strong>{desc}</strong></Button>
        </li>
      )
    }
  });

  if (!gameStarted) {
    return (
      <GameForm
        p1IsX={p1IsX}
        p1={players.p1}
        p2={players.p2}
        startGame={startGame}
        handleFormChange={handleFormChange}
        toggleXOrO={toggleXOrO}
        />);
  } else {
    return (
      <Container maxWidth="sm">
        <h1>{(players.p1 != null && players.p2 != null) ? <span>{players.p1} vs {players.p2}</span> : null}</h1>
        <div className="game-board">
          <Board
            squares = {current.squares}
            winObj = {win}
            onClick = {handleClick}
            />
        </div>
        <div className="App-info">
          <div>
            <Button onClick={sortHistoryOrder}>Sort history order</Button>
            <Button onClick={restart}>New Game</Button>
          </div>
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </Container>
    )
  }
}

export {
  GameForm,
  Game
}

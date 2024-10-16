import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Container from '@material-ui/core/Container';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import TextField from '@material-ui/core/TextField';
import Alert from '@material-ui/lab/Alert';
import React, { useState } from 'react';

import Board from './board.js';

function GameForm(props) {
  return (
    <>
      <h1>New Game</h1>
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
              <Checkbox data-testid='p1isx' checked={props.p1IsX} onChange={props.toggleXOrO} />
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
        { props.formError && <Alert severity="error" data-testid="form-error-alert">{props.formError}</Alert> }
      </form>
    </>
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
  const [formError, setFormError] = useState(null);

  const startGame = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (players.p1 == null || players.p2 == null || players.p1 === '' || players.p2 === '') {
      setFormError('Please enter player names');
      return;
    }
    else if (players.p1 === players.p2) {
      setFormError('Player names must be unique');
      return;
    } else {
      setFormError(null);
    }
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
      // do nothing if there is already a winner or the square is already filled
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
      return history.slice().reverse();
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
    let winner_name = players.p2;
    if (win.winner === 'X' && p1IsX) {
      winner_name = players.p1;
    }
    status = `The winner is ${winner_name} (${win.winner})`;
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
    return (
      <li key={move}>
        <Button onClick={() => jumpTo(move)}>
          {last ? <strong>{desc}</strong> : desc}
        </Button>
      </li>
    );
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
        formError={formError}
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
        <div className="game-info">
          <div>
            <Button onClick={sortHistoryOrder} data-testid="history-sort">Sort history order</Button>
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
  Game, GameForm
};


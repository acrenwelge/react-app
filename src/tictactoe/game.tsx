import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
import TextField from '@mui/material/TextField';
import { ColorPicker } from 'material-ui-color';
import React, { useState } from 'react';

import { Grid2 } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import Board from './board';
import GameResult from './gameResult';

interface History {
  squares: string[];
  move: number[];
}

export interface Players {
  p1: {name?: string, color: string, symbol: string};
  p2: {name?: string, color: string, symbol: string};
}

export interface WinObj {
  winner: keyof Players | null;
  winSquares?: number[];
}

interface GameFormProps {
  players: Players;
  startGame: (e: React.FormEvent) => void;
  handleFormChange: (val: string, playerId: keyof Players, playerProperty: keyof Players['p1']) => void;
  formError: string | null;
}

function GameForm(props: GameFormProps) {
  return (
    <>
      <h1>New Game</h1>
      <form onSubmit={props.startGame} >
        <FormGroup row style={{alignItems: 'end'}}>
          <TextField
            name="p1"
            label="Player 1 Name"
            margin="normal"
            required
            inputProps={{ 'data-testid': 'p1-name' }}
            onChange={e => props.handleFormChange(e.target.value, 'p1', 'name')}
          />
          <ColorPicker
            value={props.players['p1']['color']}
            onChange={(color) => {props.handleFormChange('#'+color.hex, 'p1', 'color')}}
            />
        </FormGroup>
        <FormGroup row style={{alignItems: 'end'}}>
          <TextField
            name="p2"
            label="Player 2 Name"
            margin="normal"
            required
            inputProps={{ 'data-testid': 'p2-name' }}
            onChange={e => props.handleFormChange(e.target.value, 'p2', 'name')}
          />
          <ColorPicker
            value={props.players['p2']['color']}
            onChange={(color) => {props.handleFormChange('#'+color.hex, 'p2', 'color')}}
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
      <Link to="/leaderboard">Leaderboard</Link>
    </>
  );
}

interface GameProps {
  triggerAlert: (severity: 'success'|'error', message: string) => void;
}

function Game(props: GameProps) {
  const [history, setHistory] = useState<History[]>([
    {
      squares: Array(9).fill(null),
      move: [],
    }]);
  const [stepNumber, setStepNumber] = useState(0);
  const [players, setPlayers] = useState<Players>({
    p1: {color: '#0000FF', symbol: 'X'},
    p2: {color: '#FF0000', symbol: 'O'},
  });
  const [P1IsNext, setP1IsNext] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const startGame = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!players.p1 || !players.p2) {
      setFormError('Please enter player names');
      return;
    } else if (players.p1.name === players.p2.name) {
      setFormError('Player names must be unique');
      return;
    } else {
      setFormError(null);
    }
    setGameStarted(true);
    setP1IsNext(true);
  }

  const restart = (e: React.MouseEvent) => {
    setGameStarted(false);
    setHistory([{
      squares: Array(9).fill(null),
      move: [],
    }]);
    setStepNumber(0);
    setP1IsNext(true);
  }

  /** Converting index of the square to [x,y] coordinates on the tic-tac-toe board */
  const convertToCoords = (i: number) => {
    let x = i % 3;
    let y = Math.floor(i/3);
    return [x,y];
  }

  /**
   * @returns undefined if there is no winner, otherwise returns the winner symbol and the winning squares
   */
  const calculateWinner = (squares: string[]): WinObj | undefined => {
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
          winner: squares[a] === players.p1.symbol ? 'p1' : 'p2',
          winSquares: [a, b, c]
        }
      }
    }
    if (!squares.includes(null as any)) {
      return {
        winner: null, // draw!
        winSquares: []
      }
    }
  }

  const handleSquareClick = (i: number) => {
    const current = history[stepNumber];
    const squares = current.squares.slice();
    const [x,y] = convertToCoords(i);
    if (calculateWinner(squares) || squares[i]) {
      // do nothing if there is already a winner or the square is already filled
      return;
    }
    squares[i] = P1IsNext ? players.p1.symbol : players.p2.symbol;
    setHistory((history) => {
        return history.concat(
          {
            squares: squares,
            move: [x, y],
          });
    });
    setStepNumber(history.length);
    setP1IsNext(prev => !prev);
  }

  const jumpTo = (step: number) => {
    setStepNumber(step);
    setHistory(history => history.slice(0, step + 1));
    setP1IsNext((old) => {
      if (P1IsNext) return (step % 2) === 0;
      else return (step % 2) !== 0;
    });
  }

  const handleFormChange = (val: string, playerId: keyof Players, playerProperty: keyof Players['p1']) => {
    setPlayers((oldPlayers) => {
      let newPlayers = {...oldPlayers};
      newPlayers[playerId][playerProperty] = val;
      return newPlayers;
    });
  }
  
  const saveGameResult = async () => {
    const win = calculateWinner(history[history.length-1].squares);
    const winner = win?.winner === 'p1' ? players.p1.name : players.p2.name;
    const timestamp = dayjs(new Date());
    const gameResult: GameResult = {
      p1: players.p1.name!,
      p2: players.p2.name!,
      winner: win?.winner || 'draw',
      timestamp: timestamp
    };
    axios.post('/games/gameResults', gameResult)
      .catch((err) => {
        props.triggerAlert('error', 'Save failed');
        console.error(err);
      })
      .then((data) => {
        if (data!.status < 300) {
          props.triggerAlert('success', 'Game result saved');
          console.log('Game result saved successfully');
        }
      })
  }

  const current = history[history.length-1];
  const win = calculateWinner(current.squares);

  let status;
  if (win && win.winner) {
    status = `The winner is ${players[win.winner].name} (${players[win.winner].symbol})!`;
  } else if (win && !win.winner) {
    status = "The game is a draw!";
  } else {
    status = `Next player: ${P1IsNext ? players.p1.name : players.p2.name}`;
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
      <Grid2 size={12}>
        <GameForm
          players={players}
          startGame={startGame}
          handleFormChange={handleFormChange}
          formError={formError}
          />
      </Grid2>
    );
  } else {
    return (
      <Grid2 container>
        <Grid2 size={12} display="flex" justifyContent="center" alignItems="center">
          <h1>
            <span style={{color: players.p1.color}}>{players.p1.name}</span> vs <span style={{color: players.p2.color}}>{players.p2.name}</span>
          </h1>
        </Grid2>
        <Grid2 size={{xs: 12, sm: 8}} className="game-board" display="flex" justifyContent="center" alignItems="center">
          <Board
          squares = {current.squares}
          winObj = {win}
          players={players}
          onClick = {handleSquareClick}
          />
        </Grid2>
        <Grid2 size={{xs: 12, sm: 4}} className="game-info">
          <div>
            <Button onClick={restart}>New Game</Button>
          </div>
          <div>{status}</div>
          {win && <div><Button onClick={saveGameResult}>Save Game Result</Button></div>}
          <ol>{moves}</ol>
        </Grid2>
      </Grid2>
    )
  }
}

export {
  Game, GameForm
};


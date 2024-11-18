import Button from '@mui/material/Button';
import { Color, createColor } from 'material-ui-color';
import React, { useState } from 'react';

import { Box, Grid2, List, ListItem } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import Board from './board';
import GameForm from './gameForm';
import GameResult from './gameResult';

interface History {
  squares: string[];
  move: number[];
}

export interface Players {
  p1: {name?: string, color: Color, symbol: string};
  p2: {name?: string, color: Color, symbol: string};
}

export interface WinObj {
  winner: keyof Players | null;
  winSquares?: number[];
}

interface GameProps {
  triggerAlert: (severity: 'success'|'error', message: string) => void;
}

export interface GameConfig {
  boardSize: number;
  winLength: number;
}

function Game(props: GameProps) {
  const [stepNumber, setStepNumber] = useState(0);
  const [players, setPlayers] = useState<Players>({
    p1: {color: createColor("#0000FF"), symbol: 'X'},
    p2: {color: createColor("#FF0000"), symbol: 'O'},
  });
  const [P1IsNext, setP1IsNext] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    winLength: 3,
    boardSize: 3
  });
  const startHistory: History = {
    squares: Array(gameConfig.boardSize**2).fill(null),
    move: [],
  }
  const [history, setHistory] = useState<History[]>([startHistory]);

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
    setHistory([startHistory]);
    setStepNumber(0);
    setP1IsNext(true);
  }

  /** Converting index of the square to [x,y] coordinates on the tic-tac-toe board */
  const convertToCoords = (i: number) => {
    let row = i % gameConfig.boardSize;
    let col = Math.floor(i / gameConfig.boardSize);
    return [row, col];
  }

  /**
   * @returns undefined if there is no winner, otherwise returns the winner symbol and the winning squares
   */
  const calculateWinner = (squares: string[]): WinObj | undefined => {
    const { boardSize, winLength } = gameConfig;

    const checkLine = (start: number, step: number, length: number) => {
      const symbol = squares[start];
      if (!symbol) return false;
      for (let i = 1; i < length; i++) {
        if (squares[start + i * step] !== symbol) return false;
      }
      return true;
    };

    // Check rows, columns, and diagonals
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j <= boardSize - winLength; j++) {
        // Check row
        if (checkLine(i * boardSize + j, 1, winLength)) {
          return {
            winner: squares[i * boardSize + j] === players.p1.symbol ? 'p1' : 'p2',
            winSquares: Array.from({ length: winLength }, (_, k) => i * boardSize + j + k)
          };
        }
        // Check column
        if (checkLine(j * boardSize + i, boardSize, winLength)) {
          return {
            winner: squares[j * boardSize + i] === players.p1.symbol ? 'p1' : 'p2',
            winSquares: Array.from({ length: winLength }, (_, k) => (j + k) * boardSize + i)
          };
        }
      }
    }

    // Check diagonals
    for (let i = 0; i <= boardSize - winLength; i++) {
      for (let j = 0; j <= boardSize - winLength; j++) {
        // Check main diagonal
        if (checkLine(i * boardSize + j, boardSize + 1, winLength)) {
          return {
            winner: squares[i * boardSize + j] === players.p1.symbol ? 'p1' : 'p2',
            winSquares: Array.from({ length: winLength }, (_, k) => (i + k) * boardSize + j + k)
          };
        }
        // Check anti-diagonal
        if (checkLine(i * boardSize - j, boardSize - 1, winLength)) {
          return {
            winner: squares[i * boardSize - j] === players.p1.symbol ? 'p1' : 'p2',
            winSquares: Array.from({ length: winLength }, (_, k) => (i - k) * boardSize + j + k)
          };
        }
      }
    }

    if (!squares.includes(null as any)) {
      return {
        winner: null, // draw!
        winSquares: []
      };
    }
  };

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
    setP1IsNext(step % 2 === 0);
  }

  const playerFormChange = (val: string, playerId: keyof Players, playerProperty: keyof Players['p1']) => {
    setPlayers((oldPlayers) => {
      let newPlayers = {...oldPlayers};
      if (playerProperty !== 'color') {
        newPlayers[playerId][playerProperty] = val;
      }
      return newPlayers;
    });
  }

  const colorChange = (color: Color, playerId: keyof Players) => {
    setPlayers((oldPlayers) => {
      let newPlayers = {...oldPlayers};
      newPlayers[playerId].color = color;
      return newPlayers;
    });
  }

  const winLengthChange = (val: number) => {
    // winLength validation: must be between 2 and boardSize
    if (val < 2 || val > gameConfig.boardSize || isNaN(val)) {
      return;
    }
    setGameConfig((oldConfig) => { return {...oldConfig, winLength: val} });
  }

  const boardSizeChange = (val: number) => {
    // boardSize validation: must be between 3 and 10, and no smaller than winLength
    if (val < 3 || val > 10 || val < gameConfig.winLength || isNaN(val)) {
      return;
    }
    setGameConfig((oldConfig) => { return {...oldConfig, boardSize: val} });
  }
  
  const saveGameResult = async () => {
    const win = calculateWinner(history[history.length-1].squares);
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
      <ListItem key={move}>
        <Button variant='outlined' onClick={() => jumpTo(move)}>
          {last ? <strong>{desc}</strong> : desc}
        </Button>
      </ListItem>
    );
  });

  if (!gameStarted) {
    return (
      <Grid2 size={12}>
        <GameForm
          players={players}
          startGame={startGame}
          playerFormChange={playerFormChange}
          colorChange={colorChange}
          gameConfig={gameConfig}
          winLengthChange={winLengthChange}
          boardSizeChange={boardSizeChange}
          formError={formError}
          />
      </Grid2>
    );
  } else {
    return (
      <Grid2 container>
        <Grid2 size={12} display="flex" justifyContent="center" alignItems="center">
          <h1>
            <span style={{color: '#'+players.p1.color.hex}}>{players.p1.name}</span> vs <span style={{color: '#'+players.p2.color.hex}}>{players.p2.name}</span>
          </h1>
        </Grid2>
        <Grid2 size={{xs: 12, sm: 8}} className="game-board" display="flex" justifyContent="center" alignItems="flex-start">
          <Board
          squares = {current.squares}
          gameConfig={gameConfig}
          winObj = {win}
          players={players}
          onClick = {handleSquareClick}
          />
        </Grid2>
        <Grid2 size={{xs: 12, sm: 4}} className="game-info">
          <Box><Button variant="contained" onClick={restart}>New Game</Button></Box>
          <Box mt={2} mb={2}>{status}</Box>
          {win && <Box><Button color='secondary' onClick={saveGameResult}>Save Game Result</Button></Box>}
          <Box><List>{moves}</List></Box>
        </Grid2>
      </Grid2>
    )
  }
}

export {
  Game, GameForm
};

import { Grid2 } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import GameTable from './gameHistoryTable';
import GameResult from './gameResult';

const leaderboard = [
  { player: 'Alice', wins: 10 },
  { player: 'Charlie', wins: 8 },
  { player: 'Bob', wins: 5 },
];

interface LeaderboardResult {
  player: string;
  wins: number;
}

const Leaderboard: React.FC = () => {
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);

  const playerWins: LeaderboardResult[] = [];

  for (const game of gameHistory) {
    if (game.winner === 'draw') {
      continue;
    }
    let winner_name: string;
    if (game.winner === 'p1') {
      winner_name = game.p1;
    } else if (game.winner === 'p2') {
      winner_name = game.p2;
    } else {
      winner_name = 'Draw';
    }
    const player = playerWins.find((player) => player.player === winner_name);
    if (player) {
      player.wins++;
    } else {
      playerWins.push({ player: winner_name, wins: 1 });
    }
  }

  useEffect(() => {
    const fetchGameHistory = async () => {
      try {
        const response = await axios.get('/games/gameResults');
        setGameHistory(response.data);
      } catch (error) {
        console.error('Error fetching game history:', error);
      }
    };
    fetchGameHistory();
  }, []);

  return (
    <Grid2 container>
      <Grid2>
        <h2>Game History</h2>
        <GameTable games={gameHistory} />
      </Grid2>
      <Grid2>
        <h2>Leaderboard</h2>
        <ul>
          {playerWins.map((obj, index) => (
            <li key={index}>
              {obj.player}: {obj.wins} wins
            </li>
          ))}
        </ul>
      </Grid2>
    </Grid2>
  );
};

export default Leaderboard;
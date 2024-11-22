import { Grid2 } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import GameTable from './GameHistoryTable';
import GameResult from './GameResult';

interface LeaderboardResult {
  player: string;
  wins: number;
}

const Leaderboard: React.FC = () => {
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);

  const sortedPlayerWins: LeaderboardResult[] = [];

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
    const player = sortedPlayerWins.find((player) => player.player === winner_name);
    if (player) {
      player.wins++;
    } else {
      sortedPlayerWins.push({ player: winner_name, wins: 1 });
    }
    sortedPlayerWins.sort((a, b) => b.wins - a.wins);
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
    <Grid2 container display="flex" justifyContent="center">
      <Grid2>
        <h2>Game History</h2>
        <GameTable games={gameHistory} />
      </Grid2>
      <Grid2 sx={{ml: 10}}>
        <h2>Leaderboard</h2>
        <List>
          {sortedPlayerWins.map((obj, index) => (
            <ListItem key={index}>
              {obj.player}: {obj.wins} wins
            </ListItem>
          ))}
        </List>
      </Grid2>
    </Grid2>
  );
};

export default Leaderboard;
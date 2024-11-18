import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import dayjs from 'dayjs';
import * as React from 'react';
import GameResult from './gameResult';

function GameHistoryTable(props: {games: GameResult[]}) {
  return (
    <TableContainer component={Paper} elevation={6}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell align="right">Player 1</TableCell>
            <TableCell align="right">Player 2</TableCell>
            <TableCell align="right">Winner</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.games.map((result) => (
            <TableRow
              key={result._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {dayjs(result.timestamp).format('MM/DD/YYYY')}
              </TableCell>
              <TableCell align="right">{result.p1}</TableCell>
              <TableCell align="right">{result.p2}</TableCell>
              <TableCell align="right">{result.winner === 'draw' ? 'Draw' : result.winner === 'p1' ? result.p1 : result.p2}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default GameHistoryTable;
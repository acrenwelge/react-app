import { Alert, Box, Button, FormControl, FormGroup, Grid2, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { Color, ColorPicker } from "material-ui-color";
import React from "react";
import { Link } from "react-router-dom";
import { GameConfig, Players } from "./game";

interface GameFormProps {
  players: Players;
  startGame: (e: React.FormEvent) => void;
  playerFormChange: (val: string, playerId: keyof Players, playerProperty: keyof Players['p1']) => void;
  colorChange: (color: Color, playerId: keyof Players) => void;
  gameConfig: GameConfig;
  winLengthChange: (val: number) => void;
  boardSizeChange: (val: number) => void;
  formError: string | null;
}

export default function GameForm(props: GameFormProps) {
  return (
    <Grid2 container>
      <Grid2 size={{xl: 12}}>
        <h1>New Tic Tac Toe Game</h1>
        <form onSubmit={props.startGame}>
          <FormGroup row style={{alignItems: 'end'}}>
            <TextField
              name="p1"
              label="Player 1 Name"
              margin="normal"
              value={props.players['p1']['name']}
              required
              inputProps={{ 'data-testid': 'p1-name' }}
              onChange={e => props.playerFormChange(e.target.value, 'p1', 'name')}
            />
            <ColorPicker
              value={props.players['p1']['color']}
              onChange={(value) => {props.colorChange(value, 'p1')}}
              />
            <FormControl>
              <InputLabel id="p1-symbol-label">Symbol</InputLabel>
              <Select
                labelId="p1-symbol-label"
                id="p1-symbol"
                value={props.players.p1.symbol}
                onChange={e => props.playerFormChange(e.target.value, 'p1', 'symbol')}
              >
                <MenuItem value={'X'}>X</MenuItem>
                <MenuItem value={'O'}>O</MenuItem>
                <MenuItem value={'?'}>?</MenuItem>
                <MenuItem value={'!'}>!</MenuItem>
                <MenuItem value={'+'}>+</MenuItem>
                <MenuItem value={'-'}>-</MenuItem>
              </Select>
            </FormControl>
          </FormGroup>
          <FormGroup row style={{alignItems: 'end'}}>
            <TextField
              name="p2"
              label="Player 2 Name"
              margin="normal"
              value={props.players['p2']['name']}
              required
              inputProps={{ 'data-testid': 'p2-name' }}
              onChange={e => props.playerFormChange(e.target.value, 'p2', 'name')}
            />
            <ColorPicker
              value={props.players['p2']['color']}
              onChange={(value) => {props.colorChange(value, 'p2')}}
            />
            <FormControl>
              <InputLabel id="p2-symbol-label">Symbol</InputLabel>
              <Select
                labelId="p2-symbol-label"
                id="p2-symbol"
                value={props.players.p2.symbol}
                onChange={e => props.playerFormChange(e.target.value, 'p2', 'symbol')}
              >
                <MenuItem value={'X'}>X</MenuItem>
                <MenuItem value={'O'}>O</MenuItem>
                <MenuItem value={'?'}>?</MenuItem>
                <MenuItem value={'!'}>!</MenuItem>
                <MenuItem value={'+'}>+</MenuItem>
                <MenuItem value={'-'}>-</MenuItem>
              </Select>
            </FormControl>
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
        <Box mt={2}>
          <Link to="/leaderboard"><Button color='secondary' variant='outlined'>View Leaderboard</Button></Link>
        </Box>
      </Grid2>
      <Grid2 size={{xl: 12}} ml={6}>
        <h2>Game Configuration</h2>
        <form>
          <FormGroup row style={{alignItems: 'end'}}>
            <TextField
              name="boardSize"
              type="number"
              label="Board Size"
              margin="normal"
              value={props.gameConfig.boardSize}
              required
              onChange={e => props.boardSizeChange(parseInt(e.target.value))}
            />
          </FormGroup>
          <FormGroup row style={{alignItems: 'end'}}>
            <TextField
              name="winLength"
              type="number"
              label="Win Length"
              margin="normal"
              value={props.gameConfig.winLength}
              required
              onChange={e => props.winLengthChange(parseInt(e.target.value))}
            />
          </FormGroup>
        </form>
      </Grid2>
    </ Grid2>
  );
}
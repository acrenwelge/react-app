import { Grid2 } from '@mui/material';
import React from 'react';
import './board.css';
import { GameConfig, Players, WinObj } from './game';
import Square from './square';

interface BoardProps {
  gameConfig: GameConfig;
  squares: string[];
  onClick: (i: number) => void;
  winObj?: WinObj;
  players: Players;
}

export default class Board extends React.Component<BoardProps> {

  renderSquare(idx: number, highlight: boolean) {
    console.log(this.props.players.p1.color.hex);
    let textHexColor = this.props.players.p2.color.hex;
    if (this.props.squares[idx] === this.props.players.p1.symbol) {
      textHexColor = this.props.players.p1.color.hex;
    }
    return (
      <Square
      key={idx}
      symbol={this.props.squares[idx]}
      highlight={highlight}
      textHexColor={'#'+textHexColor}
      onClick={() => this.props.onClick(idx)}/>
      )
  }

  render() {
    let divs = [];
    for (let i = 0; i < this.props.gameConfig.boardSize; i++) {
      let sqrs = [];
      for (let j = 0; j < this.props.gameConfig.boardSize; j++) {
        const idx = i * this.props.gameConfig.boardSize + j;
        const winObj = this.props.winObj;
        if (winObj && winObj.winSquares && winObj.winSquares.includes(idx)) {
          sqrs.push(this.renderSquare(idx, true));
        } else {
          sqrs.push(this.renderSquare(idx, false));
        }
      }
      divs.push(<div className="board-row" key={i}>{sqrs}</div>);
    }

    return (
      <Grid2 container>
        <Grid2>
          {divs}
        </Grid2>
      </Grid2>
    );
  }
}

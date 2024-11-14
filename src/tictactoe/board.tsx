import { Grid2 } from '@mui/material';
import React from 'react';
import './board.css';
import { Players, WinObj } from './game';
import Square from './square';

interface BoardProps {
  squares: string[];
  onClick: (i: number) => void;
  winObj?: WinObj;
  players: Players;
}

export default class Board extends React.Component<BoardProps> {

  renderSquare(i: number, highlight: boolean) {
    console.log(this.props.players);
    let textHexColor = this.props.players.p2.color;
    if (this.props.squares[i] === this.props.players.p1.symbol) {
      textHexColor = this.props.players.p1.color;
    }
    return (
      <Square
      key={i}
      symbol={this.props.squares[i]}
      highlight={highlight}
      textHexColor={textHexColor}
      onClick={() => this.props.onClick(i)}/>
      )
  }

  render() {
    let divs = [];
    for (let i=0;i<3;i++) {
      let sqrs = [];
      for (let j=0;j<3;j++) {
        const idx = i*3 + j;
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

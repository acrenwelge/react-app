import React from 'react';
import './board.css';
import Square from './square';

interface BoardProps {
  squares: string[];
  onClick: (i: number) => void;
  winObj: any;
  players: any;
  p1IsX: boolean;
}

export default class Board extends React.Component<BoardProps> {

  renderSquare(i: number, highlight: boolean) {
    console.log(this.props.players);
    console.log(this.props.p1IsX);
    let textHexColor = this.props.players.p2.color;
    if ((this.props.p1IsX && this.props.squares[i] === 'X')
      || (!this.props.p1IsX && this.props.squares[i] === 'O')) {
      textHexColor = this.props.players.p1.color;
    }
    return (
      <Square
      key={i}
      value={this.props.squares[i]}
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
      <div>
        {divs}
      </div>
    );
  }
}

import React from 'react';
import './board.css';
import Square from './square.js';

export default class Board extends React.Component {

  renderSquare(i, highlight) {
    console.log(this.props.players);
    console.log(this.props.p1IsX);
    let textColor = this.props.players.p2.color;
    if ((this.props.p1IsX && this.props.squares[i] === 'X')
      || (!this.props.p1IsX && this.props.squares[i] === 'O')) {
      textColor = this.props.players.p1.color;
    }
    return (
      <Square
      key={i}
      value={this.props.squares[i]}
      highlight={highlight}
      textColor={textColor}
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

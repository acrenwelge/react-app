import React from 'react';
import Square from './square.js';
import './board.css';

export default class Board extends React.Component {

  renderSquare(i, highlight) {
    return (
      <Square
      key={i}
      value={this.props.squares[i]}
      highlight={highlight}
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

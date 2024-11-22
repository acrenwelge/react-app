import React from 'react';
import './square.css';

interface SquareProps {
  highlight: boolean;
  textHexColor: string;
  symbol: string;
  onClick: () => void;
}

export default function Square(props: SquareProps) {
  let className = "square";
  if (props.highlight) {
    className="square hl";
  }
  return (
    <button className={className} onClick={props.onClick} style={{color: props.textHexColor}}>
      {props.symbol}
    </button>
  );
}

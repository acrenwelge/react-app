import React from 'react';
import './square.css';

interface SquareProps {
  highlight: boolean;
  textHexColor: string;
  value: string;
  onClick: () => void;
}

export default function Square(props: SquareProps) {
  let cn = "square";
  if (props.highlight) {
    cn="square hl";
  }
  return (
    <button className={cn} onClick={props.onClick} style={{color: props.textHexColor}}>
      {props.value}
    </button>
  );
}

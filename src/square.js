import React from 'react';
import './square.css';

export default function Square(props) {
  let cn = "square";
  if (props.highlight) {
    cn="square hl";
  }
  return (
    <button className={cn} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

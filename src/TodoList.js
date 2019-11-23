import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';

function TodoList(props) {
  return (
    <React.Fragment>
      <div>
        <h1>My Todos</h1>
      </div>
      <div>
        <ul>
          {props.children}
        </ul>
      </div>
      <div>
        <Button
        color="primary"
        onClick={props.addItem}>
          Add
        </Button>
        <Button
        color="secondary"
        onClick={props.removeCompleted}>
          Remove Completed
        </Button>
      </div>
    </React.Fragment>
  )
}

function TodoItem(props) {
  const item = props.item;
  return (
    <li>
      <Checkbox checked={item.completed}
        onChange={props.onToggle}
        value={item.id}
        tabIndex={item.id * 2}
        />

      <Input type="text"
      tabIndex={item.id * 2 + 1}
      value={item.text}
      id={props.id.toString()}
      className={item.completed ? 'item-done' : ''}
      onKeyDown={props.onKeyDown}
      onChange={props.onChange}/>
    </li>
  )
}

export {
  TodoList,
  TodoItem
}

import { Alert, Chip, FormGroup, TextField } from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';
import { Link, useParams } from 'react-router-dom';

export interface Item {
  id: number;
  text: string;
  completed: boolean;
  priority: number | null;
  dueDate?: dayjs.Dayjs;
}

interface TodoItemDetailProps {
  todos: Item[];
}

function TodoItemDetail(props: TodoItemDetailProps) {
  let { id } = useParams<{ id: string }>();
  const paramId = parseInt(id);
  const todo = props.todos.find(todo => todo.id === paramId);

  if (!todo) {
    return (<Alert severity="error">
      <div data-testid='item-detail'>Todo item not found</div>
    </Alert>)
  }

  return (
    <div data-testid='item-detail'>
       {/* TODO: Search for prev/next items, not hard code id values */}
      <div>
        <Link to={`/todos/${paramId-1}`}>Previous Item</Link>
      </div>
      <div>
        <Link to={`/todos/${paramId+1}`}>Next Item</Link>
      </div>
      <h2>Task Details</h2>
      <FormGroup row>
        <TextField
          multiline
          value={todo.text}
        />
      </FormGroup>
      <FormGroup row>
        {todo.completed ? <Chip label="Completed" color="primary" /> : <Chip label="Pending" color="default" />}
      </FormGroup>
      <FormGroup row>
        {todo.priority === 1 ? <Chip label={`Priority: ${todo.priority}`} color="primary" /> : ""}
        {todo.priority === 2 ? <Chip label={`Priority: ${todo.priority}`} color="secondary" /> : ""}
        {todo.priority === 3 ? <Chip label={`Priority: ${todo.priority}`} color="default" /> : ""}
        {!todo.priority ? <Chip label="Priority: N/A"/> : ""}
      </FormGroup>
      <FormGroup row>
        {todo.dueDate ? <Chip label={`Due: ${todo.dueDate.format("MM-DD-YYYY")}`} color="primary" /> : ""}
      </FormGroup>
    </div>
  );
}

export default TodoItemDetail;

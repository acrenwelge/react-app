import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DoneIcon from '@mui/icons-material/Done';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import PendingIcon from '@mui/icons-material/Pending';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import StarIcon from '@mui/icons-material/Star';
import { Alert, Chip, FormGroup, Grid2, Paper, TextField } from '@mui/material';
import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Item } from './todo_types';

interface TodoItemDetailProps {
  todos: Item[];
}

function TodoItemDetail(props: TodoItemDetailProps) {
  let { id } = useParams<{ id: string }>();
  const currentIndex = props.todos.findIndex(todo => todo._id === id);
  const [todo, setTodo] = React.useState<Item | undefined>(props.todos.find(todo => todo._id === id));

  useEffect(() => {
    setTodo(props.todos.find(todo => todo._id === id));
  }, [id, props.todos]);

  if (!todo) {
    return (<Alert severity="error">
      <div data-testid='item-detail'>Todo item not found</div>
    </Alert>)
  }

  const priorityColor = todo.priority === 1 ? 'primary' : todo.priority === 2 ? 'secondary' : 'default';

  const editText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTodo({...todo, text: e.target.value});
  }

  const editPriority = (e: React.MouseEvent) => {
    let newPriority: number | null = 3;
    if (todo.priority === 3) {
      newPriority = null;
    } else {
      newPriority = todo.priority ? todo.priority + 1 : 1;
    }
    setTodo({...todo, priority: newPriority});
  }

  return (
    <Grid2 container rowSpacing={3} data-testid='item-detail' display='flex' alignItems='center' justifyContent='center'>
      <Grid2 size={4} display='flex' alignItems='flex-start' justifyContent='flex-start'>
        {currentIndex > 0 && <Link to={`/todos/${props.todos[currentIndex-1]._id}`}>
          <ArrowBackIcon fontSize='small'/>
          Previous
        </Link>}
      </Grid2>
      <Grid2 size={4} display='flex' alignItems='center' justifyContent='center'>
        <Link to="/todos">
          All Todo Items
        </Link>
      </Grid2>
      <Grid2 size={4} display='flex' alignItems='flex-end' justifyContent='flex-end'>
        {currentIndex+1 < props.todos.length && <Link to={`/todos/${props.todos[currentIndex+1]._id}`}>
          <ArrowForwardIcon fontSize='small'/>
          Next
        </Link>}
      </Grid2>
      <Paper elevation={3} sx={{padding: '10px', marginTop: '5px'}}>
        <h2>Task Details</h2>
        <Grid2 container rowSpacing={3}>
          <Grid2 size={12}>
            <FormGroup row>
              <TextField
                fullWidth
                multiline
                value={todo.text}
                onChange={editText}
              />
            </FormGroup>
          </Grid2>
          <Grid2 size={4}>
            <FormGroup row>
              {todo.completed ? <DoneIcon /> : <PendingIcon />}
              <Chip label={`Status: ${todo.completed ? 'Completed':'Pending'}`} 
              color={`${todo.completed ? 'primary':'default'}`} 
              onClick={() => setTodo({...todo, completed: !todo.completed})}
              />
            </FormGroup>
          </Grid2>
          <Grid2 size={4}>
            <FormGroup row>
              {todo.priority === 1 ? <PriorityHighIcon /> : null}
              {todo.priority === 2 ? <StarIcon /> : null}
              {todo.priority === 3 ? <LowPriorityIcon /> : null}
              <Chip label={`Priority: ${todo.priority || "N/A"}`}
              color={priorityColor}
              onClick={editPriority}
              />
            </FormGroup>
          </Grid2>
          <Grid2 size={4}>
            <FormGroup row>
              <CalendarMonthIcon />
              {todo.dueDate ? <Chip label={`Due: ${todo.dueDate.format("MM-DD-YYYY")}`} color="primary" /> : <Chip label={`Due: N/A`} color="default" />}
            </FormGroup>
          </Grid2>
          <Grid2 size={12}>
            <FormGroup row>
              <h3>Tags</h3>
            </FormGroup>
            <FormGroup row>
              {todo.tags?.map(tag => <Chip color="info" key={tag} label={tag} />)}
            </FormGroup>
          </Grid2>
        </Grid2>
      </Paper>
    </Grid2>
  );
}

export default TodoItemDetail;

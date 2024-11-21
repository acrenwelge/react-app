import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DoneIcon from '@mui/icons-material/Done';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import PendingIcon from '@mui/icons-material/Pending';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import StarIcon from '@mui/icons-material/Star';
import { Alert, Autocomplete, Button, Checkbox, Chip, FormGroup, Grid2, List, ListItem, Paper, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Item } from './todoTypes';

interface TodoItemDetailProps {
  todos: Item[];
  tagOptions: string[];
  updateTodos: (id: string, properties: Partial<Item>) => void;
}

function TodoItemDetail(props: TodoItemDetailProps) {
  let { id } = useParams<{ id: string }>();
  const currentIndex = props.todos.findIndex(todo => todo._id === id);
  const [todo, setTodo] = React.useState<Item | undefined>(props.todos.find(todo => todo._id === id));
  const [openDatePicker, setOpenDatePicker] = React.useState(false);

  useEffect(() => {
    setTodo(props.todos.find(todo => todo._id === id));
  }, [id, props.todos]);

  if (!todo) {
    return (<Alert severity="error">
      <div data-testid='item-detail'>Todo item not found</div>
    </Alert>)
  }

  let priorityColor: 'primary' | 'secondary' | 'default' = 'default';
  if (todo.priority === 1) {
    priorityColor = 'primary';
  } else if (todo.priority === 2) {
    priorityColor = 'secondary';
  }

  const editText = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.updateTodos(id, {text: e.target.value});
  }

  const editPriority = (e: React.MouseEvent) => {
    let newPriority: number | null;
    if (todo.priority === 3) {
      newPriority = null;
    } else {
      newPriority = todo.priority ? todo.priority + 1 : 1;
    }
    const updatedTodo = {...todo, priority: newPriority};
    props.updateTodos(id, updatedTodo);
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
        <Grid2 container rowSpacing={1}>
          <Grid2 size={12}>
            <FormGroup row>
              <TextField
                data-testid="item-text"
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
              <Chip 
                data-testid="completion-status"
                label={`Status: ${todo.completed ? 'Completed':'Pending'}`} 
                color={`${todo.completed ? 'primary':'default'}`} 
                onClick={() => props.updateTodos(id, {completed: !todo.completed})}
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
              {!openDatePicker && <Chip
                onClick={() => setOpenDatePicker(true)}
                label={todo.dueDate ? `Due: ${todo.dueDate.format("MM-DD-YYYY")}` : 'Due: N/A'}
                color={todo.dueDate ? "primary" : "default"} 
              />}
              {openDatePicker && <DatePicker
                  sx={{minWidth: '50px', maxWidth: '150px'}}
                  label="Due Date"
                  value={todo.dueDate || null}
                  onChange={(val, ctx) => {
                    if (!ctx.validationError) {
                      props.updateTodos(id, { dueDate: val || undefined });
                      setOpenDatePicker(false);
                    }
                  }}
              />}
            </FormGroup>
          </Grid2>
          <Grid2 size={12}>
            <FormGroup row>
              <h3>Tags</h3>
            </FormGroup>
            <FormGroup row>
              {todo.tags?.length === 0 && <Chip label="No tags" />}
              {todo.tags?.map(tag => <Chip color="info" key={tag} label={tag} />)}
            </FormGroup>
            <FormGroup row sx={{mt: 2}}>
              <Autocomplete
                multiple
                freeSolo
                size="small"
                options={props.tagOptions}
                value={todo.tags || undefined}
                sx={{width: '250px'}}
                onChange={(e, newTags) => props.updateTodos(id, { tags: newTags })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="work, home, etc."
                  />
                )}
              />
            </FormGroup>
          </Grid2>
          <Grid2 size={12}>
            <h3>Subtasks</h3>
            <List className="todo-list">
              {todo.subtasks?.map((subtask, idx) => {
                return (<ListItem>
                <Checkbox checked={subtask.completed}
                  value={idx}
                  onChange={() => {
                    const updatedSubtask = {...subtask, completed: !subtask.completed};
                    const newSubtasks = [...todo.subtasks!];
                    newSubtasks[idx] = updatedSubtask;
                    props.updateTodos(id, {subtasks: newSubtasks});
                  }}
                />
                <TextField type="text" value={subtask.text}
                  slotProps={{htmlInput: { className: `${subtask.completed ? 'item-done' :''}`}}}
                  onChange={(e) => {
                    const updatedSubtask = {...subtask, text: e.target.value};
                    const newSubtasks = [...todo.subtasks!];
                    newSubtasks[idx] = updatedSubtask;
                    props.updateTodos(id, {subtasks: newSubtasks});
                  }}
                />
                </ListItem>)
              })}
            </List>
          </Grid2>
          <Grid2 size={12}>
            <Button color="primary" onClick={() => {
              if (!todo.subtasks) {
                props.updateTodos(id, {subtasks: [{text: '', completed: false}]});
                return;
              }
              const newSubtasks = [...todo.subtasks!, {text: '', completed: false}];
              props.updateTodos(id, {subtasks: newSubtasks});
            }}>
              Add Subtask
            </Button>
            <Button color="secondary" onClick={() => {
              if (!todo.subtasks) {return;}
              const newSubtasks = todo.subtasks.filter(subtask => !subtask.completed);
              props.updateTodos(id, {subtasks: newSubtasks});
            }}>
              Clear Completed Subtasks
            </Button>
          </Grid2>
        </Grid2>
      </Paper>
    </Grid2>
  );
}

export default TodoItemDetail;

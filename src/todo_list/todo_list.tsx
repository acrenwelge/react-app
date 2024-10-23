import { ListItem } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import Input from '@mui/material/Input';
import List from '@mui/material/List';
import Modal from '@mui/material/Modal';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
  Redirect,
  Route,
  Switch, useLocation, useRouteMatch
} from 'react-router-dom';
import TodoItemDetail, { Item } from './todo_item_detail';
import './todo_list.css';

interface TodoItemProps {
  item: Item;
  onToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>, id: number) => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>, id: number) => void;
  onPriorityChange: (event: React.ChangeEvent<HTMLInputElement>, id: number) => void;
}

const TodoItem = forwardRef<HTMLInputElement, TodoItemProps>((props, ref) => {
  const { item, onToggle, onKeyDown, onChange, onPriorityChange } = props;

  return (
    <ListItem>
      <FormGroup row>
        <Checkbox checked={item.completed}
          onChange={onToggle}
          value={item.id}
          tabIndex={item.id * 3}
          />
        <Input type="text"
          multiline
          tabIndex={item.id * 3 + 1}
          value={item.text}
          readOnly={item.completed}
          className={`${item.completed ? 'item-done' :''} priority-${item.priority}`}
          inputProps={{ className: `${item.completed ? 'item-done' :''}`}}
          ref={ref}
          onKeyDown={(e) => onKeyDown(e as React.KeyboardEvent<HTMLInputElement>, item.id)}
          onChange={(e) => onChange(e as React.ChangeEvent<HTMLInputElement>, item.id)}
          />
        <TextField type="number"
          label="priority"
          tabIndex={item.id * 3 + 2}
          value={item.priority ?? ''}
          inputProps={
            {min: 1, max: 3}
          }
          onChange={(e) => onPriorityChange(e as React.ChangeEvent<HTMLInputElement>,item.id)}
          />
        <DatePicker
          label="Due Date"
          value={item.dueDate || null}
          onChange={(date) => console.log(date)}
          />
      </FormGroup>
    </ListItem>
  )
})

export interface ItemAPI {
  id: string;
  text: string;
  completed: boolean;
  priority: number | null;
  dueDate?: string;
}

interface TodoListProps {}

function TodoList(props: TodoListProps){
  const [todos, updateTodos] = useState<Item[]>([]);
  const [toItemDetail, updateToItemDetail] = useState<number | null>(null);
  const [newItemAdded, setNewItemAdded] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const lastElementRef: React.MutableRefObject<HTMLInputElement | null> = useRef(null);
  let match = useRouteMatch();

  useEffect(() => {
    if (newItemAdded && lastElementRef.current) {
      lastElementRef.current.click();
      setNewItemAdded(false);
    }
  }, [newItemAdded]);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch('http://localhost:3001/todos');
        const rawTodos = await response.json();
        const parsedTodos: Item[] = rawTodos.map((todo: ItemAPI) => ({
          ...todo,
          id: Number(todo.id),
          dueDate: todo.dueDate ? dayjs(todo.dueDate) : undefined,
        }));
        updateTodos(parsedTodos);
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };
    fetchTodos();
  }, []); // Empty dependency array, runs once on mount

  let getMaxId = () => {
    let maxId = 0;
    for (let todo of todos) {
      if (todo.id > maxId) maxId = todo.id;
    }
    return maxId;
  }

  let addItemBtnClick = (e: React.MouseEvent) => {
      e.persist();
      updateTodos(state => {
        let newTodos: Item[] = state.slice(0,state.length);
        let maxId = getMaxId();
        newTodos.push({
          id: maxId + 1,
          text: (e.target as HTMLInputElement).value,
          completed: false,
          priority: null,
        });
        return newTodos;
      });
    }

  let addItem = (item: Item) => {
      updateTodos((state) => {
        let newTodos: Item[] = state.slice(0,state.length);
        newTodos.push({
          id: item.id,
          text: item.text,
          completed: item.completed,
          priority: item.priority,
        });
        setNewItemAdded(true);
        return newTodos;
      });
    }

  let sortByPriority = (e: React.MouseEvent) => {
    updateTodos(state => {
      let newOrder = state.slice(0,state.length);
      newOrder.sort((one, two) => {
        const a = Number(one.priority);
        const b = Number(two.priority);
        if (a === 0 && b === 0) return 0;
        else if (a === 0) return 1;
        else if (b === 0) return -1;
        return a - b;
      });
      return newOrder;
    })
  }

  let priorityChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    e.persist();
    const newPriority = Number(e.target.value);
    if (newPriority < 0 || newPriority > 3) return;
    updateTodos(todos => {
      const newTodos = todos.map((todo) => {
        if (todo.id === id) {
          let changed = Object.assign({}, todo);
          changed.priority = newPriority;
          return changed;
        } else {
          return todo;
        }
      });
      return newTodos;
    })
  }

  let removeCompleted = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.persist();
    updateTodos(state => {
      return todos.filter(todo => {return !todo.completed});
    })
  }

  let editItem = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    e.persist();
    updateTodos(state => {
      for (let i=0; i < todos.length; i++) {
        const todo = todos[i];
        if (todo.id === id) {
          let firstHalf = todos.slice(0,i);
          let secondHalf = todos.slice(i+1,todos.length);
          const newItem = {
            id: todo.id,
            text: e.target.value,
            completed: todo.completed,
            priority: todo.priority
          };
          return firstHalf.concat([newItem]).concat(secondHalf);
        }
      }
      return state;
    });
  }

  let toggleCompleted = (id: number) => {
    updateTodos(oldTodos => {
      const newList = oldTodos.map((td, idx) => {
        if (td.id === id) {
          return {
            ...td,
            completed: !td.completed,
          }
        }
        return td;
      });
      return newList;
    });
  }

  let toggleCompletedEvent = (e: React.ChangeEvent) => {
    const id = Number((e.target as HTMLInputElement).value);
    toggleCompleted(id);
  }

  let todoTextKeyInput = (e: React.KeyboardEvent<HTMLInputElement>, id: number) => {
    if (e.key === "Enter" && (e.target as HTMLInputElement).value !== '') {
      if (e.shiftKey) {
        e.preventDefault();
        toggleCompleted(id);
      } else if (e.ctrlKey) {
        e.preventDefault();
        updateToItemDetail(id);
      } else {
        e.preventDefault();
        addItem({
          id: getMaxId() + 1,
          text: '',
          completed: false,
          priority: null
        });
      }
    }
  };

  const location = useLocation();

  useEffect(() => {
    // Reset state when the route changes to a certain path
    if (location.pathname === "/todos") {
      updateToItemDetail(null);
    }
  }, [location]);

  const items = todos.map((entry, idx) => {
    if (hideCompleted && entry.completed) {
      return null;
    }
    return (
      <TodoItem
        item={entry}
        key={entry.id}
        ref={idx === todos.length - 1 ? lastElementRef : null}
        onChange={editItem}
        onToggle={toggleCompletedEvent}
        onKeyDown={todoTextKeyInput}
        onPriorityChange={priorityChange}
        />
    )
  });

  const PaperDiv = styled('div')(({theme}) => ({
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  }));

  const listView = (
    <>
      <Box>
        <h1>My Todos</h1>
      </Box>
      <Box>
        <Button onClick={() => setModalOpen(true)}>Keyboard Shortcuts</Button>
        <Modal
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          >
            <PaperDiv>
              <code>SHIFT</code> + <code>ENTER</code> - toggle completed status<br/>
              <code>CTRL</code> + <code>ENTER</code> - view item details<br/>
              <code>ENTER</code> - add new item<br/>
            </PaperDiv>
        </Modal>
      </Box>
      <Box>
        <List className='todo-list'>
          {items}
        </List>
      </Box>
      <Box>
        <Button
          data-testid="add-item"
          color="primary"
          variant='contained'
          onClick={addItemBtnClick}>
          Add
        </Button>
        <Button
          data-testid="toggle-hide-completed"
          color="info"
          onClick={() => setHideCompleted(!hideCompleted)}
          >
          {hideCompleted ? 'Show' : 'Hide'} Completed
        </Button>
        <Button
          data-testid="remove-completed"
          color="secondary"
          onClick={removeCompleted}>
          Delete All Completed
        </Button>
        <Button
          data-testid='sort-by-priority'
          onClick={sortByPriority}>
          Sort
        </Button>
      </Box>
    </>
  )

  return (
    <React.Fragment>
        {toItemDetail ? <Redirect to={`${match.url}/${toItemDetail}`} /> : '' }
        <Switch>
          <Route exact path={match.path}>
            {listView}
          </Route>
          <Route path={`${match.path}/:id`}>
            <TodoItemDetail todos={todos}/>
          </Route>
        </Switch>
    </React.Fragment>
  )
}

export default TodoList;

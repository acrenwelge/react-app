import { ListItem } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import Input from '@material-ui/core/Input';
import List from '@material-ui/core/List';
import TextField from '@material-ui/core/TextField';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
    Redirect,
    Route,
    Switch,
    useRouteMatch,
} from 'react-router-dom';
import TodoItemDetail from './todo_item_detail.js';
import './todo_list.css';

const TodoItem = forwardRef((props, ref) => {
  const item = props.item;

  return (
    <ListItem>
      <FormGroup row>
        <Checkbox checked={item.completed}
          onChange={props.onToggle}
          value={item.id}
          tabIndex={item.id * 3}
          />
        <Input type="text"
          tabIndex={item.id * 3 + 1}
          value={item.text}
          className={`${item.completed ? 'item-done' :''} priority-${item.priority}`}
          inputProps={{ className: `${item.completed ? 'item-done' :''}`}}
          ref={ref}
          onKeyDown={(e) => props.onKeyDown(e, item.id)}
          onChange={(e) => props.onChange(e, item.id)}
          />
        <TextField type="number"
          label="priority"
          tabIndex={item.id * 3 + 2}
          value={item.priority || ''}
          inputProps={
            {min: 0, max: 3}
          }
          onChange={(e) => props.onPriorityChange(e,item.id)}
          />
      </FormGroup>
    </ListItem>
  )
})

function TodoList(props){
  const [todos, updateTodos] = useState(
    [
      {
        id: 1,
        text: 'Do some testing',
        completed: false,
        priority: 2
      },
      {
        id: 2,
        text: 'Write a React app',
        completed: true,
        priority: 1,
      },
      {
        id: 3,
        text: 'Get a job!',
        completed: false,
        priority: 3,
      }]
    );
  const [toItemDetail, updateToItemDetail] = useState(null);
  const [newItemAdded, setNewItemAdded] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const lastElementRef = useRef(null);
  let match = useRouteMatch();

  useEffect(() => {
    if (newItemAdded && lastElementRef.current) {
      lastElementRef.current.click();
      setNewItemAdded(false);
    }
  }, [newItemAdded]);

  let getMaxId = () => {
    let maxId = 0;
    for (let todo of todos) {
      if (todo.id > maxId) maxId = todo.id;
    }
    return maxId;
  }

  let addItemBtnClick = (e) => {
      e.persist();
      updateTodos(state => {
        let newTodos = state.slice(0,state.length);
        let maxId = getMaxId();
        newTodos.push({
          id: maxId + 1,
          text: e.target.value,
          completed: false,
          priority: null,
        });
        return newTodos;
      });
      
    }

  let addItem = (item) => {
      updateTodos(state => {
        let newTodos = state.slice(0,state.length);
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

  let sortByPriority = (e) => {
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

  let priorityChange = (e, id) => {
    e.persist();
    updateTodos(state => {
      const priority = Number(e.target.value);
      const newTodos = state.map((todo, idx) => {
        if (todo.id === id) {
          let changed = Object.assign({}, todo);
          if (priority >= 0 && priority <= 3) {
            changed.priority = priority;
          }
          return changed;
        } else {
          return todo;
        }
      });
      return newTodos;
    })
  }

  let removeCompleted = (e) => {
    e.persist();
    updateTodos(state => {
      return todos.filter(todo => {return !todo.completed});
    })
  }

  let editItem = (e, id) => {
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
    });
  }

  let toggleCompleted = (id) => {
    updateTodos(state => {
      const newList = todos.map((el, idx) => {
        if (el.id === Number(id)) {
          return {
            id: Number(id),
            text: el.text,
            completed: !el.completed,
            priority: el.priority,
          }
        }
        return el;
      });
      return newList;
    });
  }

  let toggleCompletedEvent = (e) => {
    const id = e.target.value;
    toggleCompleted(id);
  }

  let todoTextKeyInput = (e, id) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        toggleCompleted(id);
      } else if (e.ctrlKey) {
        updateToItemDetail(id);
      } else {
        addItem({
          id: getMaxId() + 1,
          text: '',
          completed: false
        });
      }
    }
  };

  const items = todos.map((entry, idx) => {
    if (hideCompleted && entry.completed) {
      return null;
    }
    return (
      <TodoItem
        item={entry}
        key={entry.id}
        id={entry.id}
        ref={idx === todos.length - 1 ? lastElementRef : null}
        onChange={editItem}
        onToggle={toggleCompletedEvent}
        onKeyDown={todoTextKeyInput}
        onPriorityChange={priorityChange}
        />
    )
  });

  const listView = (
    <>
      <Box>
        <h1>My Todos</h1>
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
          color="default"
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

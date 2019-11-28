import React, { useState } from 'react';
import {
  Switch,
  Route,
  Redirect,
  useRouteMatch,
 } from 'react-router-dom';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import FormGroup from '@material-ui/core/FormGroup';
import TextField from '@material-ui/core/TextField';
import TodoItemDetail from './todo_item_detail.js';
import './todo_list.css';

function TodoItem(props) {
  const item = props.item;
  const isCompleteClass = item.completed ? 'item-done' : '';
  const priorityClass = `priority-${item.priority}`;

  return (
    <li>
      <FormGroup row>
        <Checkbox checked={item.completed}
          onChange={props.onToggle}
          value={item.id}
          tabIndex={item.id * 3}
          />


        <Input type="text"
          tabIndex={item.id * 3 + 1}
          value={item.text}
          className={`${isCompleteClass} ${priorityClass}`}
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
    </li>
  )
}

function TodoList() {
  const [todos, updateTodos] = useState(
    [
      {
        id: 1,
        text: 'Item 1',
        completed: false,
        priority: 1
      },
      {
        id: 2,
        text: 'Item 2',
        completed: true,
        priority: 3,
      },
      {
        id: 3,
        text: 'Item 3',
        completed: false,
        priority: null
      }]
    );
  const [toItemDetail, updateToItemDetail] = useState(null);

  let match = useRouteMatch();

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
      const newTodos = todos.filter(todo => {
        if (!todo.completed) {
          return true;
        }
        return false;
      });
      return newTodos;
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
    return (
      <TodoItem
        item={entry}
        key={entry.id}
        id={entry.id}
        onChange={editItem}
        onToggle={toggleCompletedEvent}
        onKeyDown={todoTextKeyInput}
        onPriorityChange={priorityChange}
        />
    )
  });

  const listView = (
    <>
      <div>
        <h1>My Todos</h1>
      </div>
      <div>
        <ul>
          {items}
        </ul>
      </div>
      <div>
        <Button
        color="primary"
        onClick={addItemBtnClick}>
          Add
        </Button>
        <Button
        color="secondary"
        onClick={removeCompleted}>
          Remove Completed
        </Button>
        <Button
          onClick={sortByPriority}>
          Sort
        </Button>
      </div>
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

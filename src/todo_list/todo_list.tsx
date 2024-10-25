import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Modal from '@mui/material/Modal';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import {
  Redirect,
  Route,
  Switch, useLocation, useRouteMatch
} from 'react-router-dom';
import { baseURL } from '..';
import TodoItem, { Item } from './todo_item';
import TodoItemDetail from './todo_item_detail';
import './todo_list.css';

// Code will attempt to update server with changes every TIMEOUT seconds
// OR when the number of batched 'todos' updated equals BATCH_SIZE
const BATCH_SIZE = 5;
const TIMEOUT = 5;

export interface ItemAPI extends Omit<Item, 'id' | 'dueDate'> {
  id?: string;
  dueDate?: string;
}

interface TodoListProps {}

function TodoList(props: TodoListProps){
  const [todos, updateTodos] = useState<Item[]>([]);
  const [toItemDetail, updateToItemDetail] = useState<number | null>(null);
  const [newItemAdded, setNewItemAdded] = useState(false); // Used to focus on the new item
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
        const response = await fetch(`${baseURL}/todos`);
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
      addItem(getNewBlankItem());
    }

  let addItem = (item: Item) => {
      updateTodos((oldTodoList) => {
        let newTodoList: Item[] = oldTodoList.slice();
        const newBatchedTodoItem: BatchedTodo = {
          ...item,
          operation_type: OperationType.Add
        };
        setBatchedTodos((batch) => {
          return batch.concat(newBatchedTodoItem);
        });
        newTodoList.push(item);
        setNewItemAdded(true);
        return newTodoList;
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
    const todoItem = todos.find(todo => todo.id === id);
    setBatchedTodos((batch) => {
      const batchTodo = batch.find(todo => todo.id === id);
      if (batchTodo) {
        batchTodo.priority = newPriority;
      } else if (todoItem) {
        return batch.concat({
          ...todoItem,
          operation_type: OperationType.Update
        });
      }
      return batch;
    });
    updateTodos(todos => {
      const newTodos = todos.map((todo) => {
        if (todo.id === id) {
          return {
            ...todo,
            priority: newPriority
          }
        } else {
          return todo;
        }
      });
      return newTodos;
    })
  }

  let removeCompleted = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.persist();
    setBatchedTodos((batch) => {
      const completedTodos = todos.filter(todo => todo.completed);
      const completedIds = completedTodos.map(todo => todo.id);
      const updatedBatch = batch.map(todo => 
        completedIds.includes(todo.id) ? { ...todo, operation_type: OperationType.Delete } : todo
      );
      const newCompletedTodos = completedTodos
        .filter(todo => !updatedBatch.some(batchedTodo => batchedTodo.id === todo.id)) // filter out todos already batched
        .map(todo => ({ ...todo, operation_type: OperationType.Delete }));
      return updatedBatch.concat(newCompletedTodos);
    });
    updateTodos(state => {
      return todos.filter(todo => {return !todo.completed});
    })
  }

  let editItemText = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    e.persist();
    updateTodos(oldTodos => {
      for (let i=0; i < oldTodos.length; i++) {
        const todo = oldTodos[i];
        if (todo.id === id) {
          let firstHalf = oldTodos.slice(0,i);
          let secondHalf = oldTodos.slice(i+1,oldTodos.length);
          const newItem = {
            ...todo,
            text: e.target.value,
          };
          const batchTodo = batchedTodos.find(todo => todo.id === id);
          if (batchTodo) {
            batchTodo.text = newItem.text;
          } else {
            setBatchedTodos((batch) => {
              return batch.concat({
                ...newItem,
                operation_type: OperationType.Update
              });
            });
          }
          return firstHalf.concat([newItem]).concat(secondHalf);
        }
      }
      return oldTodos;
    });
  }

  let editItemDueDate = (date: dayjs.Dayjs | null, id: number) => {
    updateTodos(oldTodos => {
      for (let i=0; i < oldTodos.length; i++) {
        const todo = oldTodos[i];
        if (todo.id === id) {
          let firstHalf = oldTodos.slice(0,i);
          let secondHalf = oldTodos.slice(i+1,oldTodos.length);
          const newItem = {
            ...todo,
            dueDate: date || undefined,
          };
          const batchTodo = batchedTodos.find(todo => todo.id === id);
          if (batchTodo && date) {
            batchTodo.dueDate = date;
          } else if (batchTodo && !date) {
            batchTodo.dueDate = undefined;
          } else {
            setBatchedTodos((batch) => {
              return batch.concat({
                ...newItem,
                operation_type: OperationType.Update
              });
            });
          }
          return firstHalf.concat([newItem]).concat(secondHalf);
        }
      }
      return oldTodos;
    });
  }

  let toggleCompleted = (id: number) => {
    updateTodos(oldTodos => {
      const newList = oldTodos.map((td, idx) => {
        if (td.id === id) {
          const newTd = {
            ...td,
            completed: !td.completed,
          }
          const batchTodo = batchedTodos.find(todo => todo.id === id);
          if (batchTodo) {
            batchTodo.completed = newTd.completed;
          } else {
            setBatchedTodos((batch) => {
              return batch.concat({
                ...newTd,
                operation_type: OperationType.Update
              });
            });
          }
          return newTd;
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

  let getNewBlankItem = () => {
    return {
      id: getMaxId() + 1, // temporary id
      text: '',
      completed: false,
      priority: null
    };
  }

  let todoTextKeyInput = (e: React.KeyboardEvent<HTMLInputElement>, id: number) => {
    // Add new item on Enter, toggle completed on Shift+Enter, view item details on Ctrl+Enter
    // as long as the current todo text field is not empty (prevents adding empty todos)
    if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim() !== '') {
      if (e.shiftKey) {
        e.preventDefault();
        toggleCompleted(id);
      } else if (e.ctrlKey) {
        e.preventDefault();
        updateToItemDetail(id);
      } else {
        e.preventDefault();
        addItem(getNewBlankItem());
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

  enum OperationType {
    Add = 'POST',
    Delete = 'DELETE',
    Update = 'PUT'
  }

  interface BatchedTodo extends Item {
    operation_type?: OperationType;
  }

  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [batchedTodos, setBatchedTodos] = useState<BatchedTodo[]>([]);

  const httpHeaders = {
    'Content-Type': 'application/json',
  };

  const updateServer = async (batch: BatchedTodo[]) => {
    const sendBatch = async (todosToUpdate: Item[], method: OperationType) => {
      if (todosToUpdate.length > 0) {
        try {
          return fetch(`${baseURL}/todos/batch`, {
            method,
            headers: httpHeaders,
            body: JSON.stringify(todosToUpdate),
          });
        } catch (error) {
          console.error(`Error ${method === OperationType.Add ? 'sending new' :
            method === OperationType.Delete ? 'deleting' : 
            'updating'} todos to the server:`, error);
        }
      }
      return Promise.reject('No pending todo changes to send');
    };

    // separate by operation type then strip the unnecessary field before sending
    const operations = [OperationType.Add, OperationType.Delete, OperationType.Update];
    let promises = [];
    for (const operation of operations) {
      const todos = batch
        .filter(todo => todo.operation_type === operation)
        .map(todo => { delete todo.operation_type; return todo; });
      if (todos.length === 0) continue;
      promises.push(sendBatch(todos, operation));
    }
    return Promise.all(promises);
  }

  useEffect(() => {
    // if batch size is reached, update the server immediately, reset the batch & clear timer
    if (batchedTodos.length >= BATCH_SIZE) {
      console.log('Batch size reached, updating server immediately');
      console.log('Batched todos:', batchedTodos);
      updateServer(batchedTodos).then((resp: Response[]) => {
        setBatchedTodos([]);
        console.log('Reset batched todos');
        resp.forEach((r) => console.log('Server response: ', r));
      }).catch((error) => {
        console.error('Error updating server:', error);
      });
      if (timer) {
        clearTimeout(timer); // cancel the pending HTTP calls
        setTimer(null); // reset the timer
        console.log('Timer cleared');
      }
    } else if (batchedTodos.length > 0 && !timer) {
      console.log('Setting timer to update server');
      if (timer) {
        clearTimeout(timer);
        console.log('Timer cleared');
      }
      // if there are pending changes, set a timer to update the server
      const newTimer = setTimeout(() => {
        console.log('timeout function running');
        console.log('Batched todos:', batchedTodos);
        console.log('Batched todos op types:');
        batchedTodos.forEach(todo => console.log(todo.operation_type));
        if (batchedTodos.length === 0) return;
        updateServer(batchedTodos).then((resp: Response[]) => {
          setBatchedTodos([]);
          console.log('Reset batched todos');
          resp.forEach((r) => console.log('Server response: ', r));
        }).catch((error) => {
          console.error('Error updating server:', error);
        });
        setTimer(null);
        console.log('TIMER COMPLETED');
      }, TIMEOUT * 1000);
      setTimer(newTimer);
    }
  }, [batchedTodos]);

  const items = todos.map((entry, idx) => {
    if (hideCompleted && entry.completed) {
      return null;
    }
    return (
      <TodoItem
        item={entry}
        key={entry.id}
        ref={idx === todos.length - 1 ? lastElementRef : null}
        onItemTextChange={editItemText}
        onCompletionToggle={toggleCompletedEvent}
        onKeyDown={todoTextKeyInput}
        onItemPriorityChange={priorityChange}
        onItemDueDateChange={editItemDueDate}
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

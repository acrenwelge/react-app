import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import { Alert, Checkbox, Divider, FormControl, FormControlLabel, FormGroup, Grid2, InputLabel, MenuItem, Select, Snackbar, SnackbarCloseReason, Switch, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import List from '@mui/material/List';
import Modal from '@mui/material/Modal';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import React, { useEffect, useRef, useState } from 'react';
import {
  Redirect,
  Route,
  Switch as RouterSwitch, useLocation, useRouteMatch
} from 'react-router-dom';
import { baseURL } from '..';
import updateServer from './todo_api';
import TodoItem from './todo_item';
import TodoItemDetail from './todo_item_detail';
import './todo_list.css';
import { batchedTodo, Item, ItemAPI, OperationType } from './todo_types';

dayjs.extend(isBetween);

// Code will attempt to update server with changes every TIMEOUT seconds
// OR when the number of batched 'todos' updated equals BATCH_SIZE
const BATCH_SIZE = 5;
const TIMEOUT = 5;
const ALERT_TIMEOUT = 3;

function TodoList(props: {}){
  const [todos, updateTodos] = useState<Item[]>([]);
  const [toItemDetail, updateToItemDetail] = useState<string | null>(null);
  const [newItemAdded, setNewItemAdded] = useState(false); // Used to focus on the new item
  const [modalOpen, setModalOpen] = useState(false);
  const [tags, setTags] = useState<Set<string>>(new Set());
  const lastElementRef: React.MutableRefObject<HTMLInputElement | null> = useRef(null);
  let match = useRouteMatch();

  /** Focuses on new todo when added so it can be edited */
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
        const rawTodos: ItemAPI[] = await response.json();
        let foundTags = new Set<string>();
        let parsedTodos: Item[] = [];
        for (const todo of rawTodos) {
          if (todo.tags) {
            for (const tag of todo.tags) {
              foundTags.add(tag);
            }
          }
          const parsedTodo = {...todo, dueDate: todo.dueDate ? dayjs(todo.dueDate) : undefined};
          parsedTodos.push(parsedTodo);
        }
        console.log('Fetched todos:', parsedTodos);
        updateTodos(parsedTodos);
        setTags(foundTags);
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };
    fetchTodos();
  }, []); // Empty dependency array, runs once on mount

  let addItemBtnClick = (e: React.MouseEvent) => {
      e.persist();
      addItem(getNewBlankItem());
    }

  let addItem = (item: Item) => {
      updateTodos((oldTodoList) => {
        let newTodoList: Item[] = oldTodoList.slice();
        const newbatchedTodoItem: batchedTodo = {
          ...item,
          operation_type: OperationType.Add
        };
        setBatchedTodos((batch) => {
          return batch.concat(newbatchedTodoItem);
        });
        newTodoList.push(item);
        setNewItemAdded(true);
        return newTodoList;
      });
    }

  let priorityChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    e.persist();
    const newPriority = Number(e.target.value);
    if (newPriority < 0 || newPriority > 3) return;
    const todoItem = todos.find(todo => todo._id === id);
    setBatchedTodos((batch) => {
      const batchTodo = batch.find(todo => todo._id === id);
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
        if (todo._id === id) {
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
      const completedIds = completedTodos.map(todo => todo._id);
      const updatedBatch = batch.map(todo => 
        completedIds.includes(todo._id) ? { ...todo, operation_type: OperationType.Delete } : todo
      );
      const newCompletedTodos = completedTodos
        .filter(todo => !updatedBatch.some(batchedTodo => batchedTodo._id === todo._id)) // filter out todos already batched
        .map(todo => ({ ...todo, operation_type: OperationType.Delete }));
      return updatedBatch.concat(newCompletedTodos);
    });
    updateTodos(state => {
      return todos.filter(todo => {return !todo.completed});
    })
  }

  const updateTodoItem = (id: string, updatedFields: Partial<Item>) => {
    updateTodos(oldTodos => {
      return oldTodos.map(todo => {
        if (todo._id === id) {
          const updatedTodo = { ...todo, ...updatedFields };
          const batchTodo = batchedTodos.find(todo => todo._id === id);
          if (batchTodo) {
            Object.assign(batchTodo, updatedFields);
          } else {
            // BUG: only first todo update is batched, subsequent updates are not batched
            setBatchedTodos(batch => batch.concat({
              ...updatedTodo,
              operation_type: OperationType.Update
            }));
          }
          return updatedTodo;
        }
        return todo;
      });
    });
  };

  const editItemText = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    e.persist();
    updateTodoItem(id, { text: e.target.value });
  };

  const editItemTags = (newTags: string[], id: string) => {
    updateTodoItem(id, { tags: newTags });
  }

  const editItemDueDate = (date: dayjs.Dayjs | null, id: string) => {
    updateTodoItem(id, { dueDate: date || undefined });
  };

  const toggleCompleted = (id: string) => {
    updateTodoItem(id, { completed: !todos.find(todo => todo._id === id)?.completed });
  }

  const toggleCompletedEvent = (e: React.ChangeEvent) => {
    const id = (e.target as HTMLInputElement).value;
    toggleCompleted(id);
  }

  function makeId(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  let getNewBlankItem = () => {
    return {
      _id: makeId(16), // temporary id
      text: '',
      completed: false,
      priority: null,
      dueDate: undefined
    };
  }

  let todoTextKeyInput = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
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

  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [batchedTodos, setBatchedTodos] = useState<batchedTodo[]>([]);
  enum AlertSeverity {
    Success = 'success',
    Error = 'error'
  }
  const [alert, setAlert] = useState({
    show: false,
    severity: AlertSeverity.Success,
    message: ''
  });

  const handleHttpResponses = (responses: Response[]) => {
    setBatchedTodos([]);
    if (responses.every((r) => r.ok)) {
      setAlert({ show: true, severity: AlertSeverity.Success, message: 'Changes saved' });
      setTimeout(() => setAlert({...alert, show: false}), ALERT_TIMEOUT * 1000);
    } else {
      setAlert({ show: true, severity: AlertSeverity.Error, message: 'Error updating server' });
    }
  }

  useEffect(() => {
    // if batch size is reached, update the server immediately, reset the batch & clear timer
    if (batchedTodos.length >= BATCH_SIZE) {
      updateServer(batchedTodos).then((responses: Response[]) => {
        handleHttpResponses(responses);
      }).catch((error) => {
        console.error('Error updating server:', error);
      });
      if (timer) {
        clearTimeout(timer); // cancel the pending HTTP calls
        setTimer(null); // reset the timer
      }
    } else if (batchedTodos.length > 0 && !timer) {
      if (timer) {
        clearTimeout(timer);
      }
      // if there are pending changes, set a timer to update the server
      const newTimer = setTimeout(() => {
        if (batchedTodos.length === 0) return;
        updateServer(batchedTodos).then((responses: Response[]) => {
          handleHttpResponses(responses);
        }).catch((error) => {
          console.error('Error updating server:', error);
        });
        setTimer(null);
      }, TIMEOUT * 1000);
      setTimer(newTimer);
    }
  }, [batchedTodos]);

  enum SortAndFilterLabels {
    None = 'None',
    Priority = 'Priority',
    DueDate = 'Due Date',
    Tags = 'Tags'
  }

  const [searchField, setSearchField] = useState<string | null>(null);
  const [searchCaseSensitive, setSearchCaseSensitive] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortAndFilterLabels>(SortAndFilterLabels.None);
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [filterBy, setFilterBy] = useState<SortAndFilterLabels | number | string>("None");

  let searchFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearchField(searchValue);
  }

  const onDelete = (id: string) => {
    setBatchedTodos((batch) => {
      const batchTodo = batch.find(todo => todo._id === id);
      if (batchTodo) {
        batchTodo.operation_type = OperationType.Delete;
      } else {
        const todoItem = todos.find(todo => todo._id === id);
        if (todoItem) {
          return batch.concat({
            ...todoItem,
            operation_type: OperationType.Delete
          });
        }
      }
      return batch;
    });
    updateTodos(todos => {
      return todos.filter(todo => todo._id !== id);
    });
  }

  const filteredTodos = todos.map((entry, idx) => {
    const searchText = searchCaseSensitive ? searchField : searchField?.toLowerCase();
    const entryText = searchCaseSensitive ? entry.text : entry.text.toLowerCase();
    // apply filter if search field is not empty and entry text contains search text
    if (!searchField || entryText.includes(searchText || '') || entry.tags?.some(tag => tag.includes(searchText || ''))) {
      if (filterBy === "overdue") {
        if (!entry.dueDate || entry.dueDate.isAfter(dayjs(), 'day')) { return null;}
      } else if (filterBy === "incomplete") {
        if (entry.completed) { return null; }
      } else if (filterBy === "complete") {
        if (!entry.completed) { return null; }
      } else if (filterBy === "today") {
        if (!entry.dueDate || !entry.dueDate.isSame(dayjs(), 'day')) { return null; }
      } else if (filterBy === "week") {
        if (!entry.dueDate || !entry.dueDate.isBetween(dayjs(), dayjs().add(1, 'week'), 'day', '[]')) { return null; }
      } else if (filterBy === "month") {
        if (!entry.dueDate || !entry.dueDate.isBetween(dayjs(), dayjs().add(1, 'month'), 'day', '[]')) { return null; }
      } else if (typeof filterBy === 'number') {
        if (entry.priority !== filterBy) { return null; }
      }
      return (
        <TodoItem
          item={entry}
          key={entry._id}
          ref={idx === todos.length - 1 ? lastElementRef : null}
          tagOptions={Array.from(tags)}
          onTagUpdate={editItemTags}
          onItemTextChange={editItemText}
          onCompletionToggle={toggleCompletedEvent}
          onKeyDown={todoTextKeyInput}
          onItemPriorityChange={priorityChange}
          onItemDueDateChange={editItemDueDate}
          onDelete={onDelete}
          />
      )
    }
  }).sort((a, b) => {
    let res = 0;
    if (sortBy === SortAndFilterLabels.Priority) {
      res = a?.props.item.priority - b?.props.item.priority;
    } else if (sortBy === SortAndFilterLabels.DueDate) {
      res = b?.props.item.dueDate?.diff(a?.props.item.dueDate);
    } else if (sortBy === SortAndFilterLabels.Tags) {
      res = a?.props.item.tags?.length - b?.props.item.tags?.length;
    }
    return sortOrder === 'asc' ? res : -res;
  });

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (batchedTodos.length > 0) {
        event.preventDefault();
        event.returnValue = ''; // Required for Chrome to show the confirmation dialog
        updateServer(batchedTodos);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [batchedTodos]);

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
        <FormControl>
          <Fab
            color="primary"
            variant='extended'
            data-testid="add-item"
            aria-label="add"
            onClick={addItemBtnClick}>
            <AddIcon />
            Add
          </Fab>
        </FormControl>
        <FormControl>
          <Button
            data-testid="remove-completed"
            color="secondary"
            onClick={removeCompleted}>
            <DeleteIcon />
            Delete All Completed
          </Button>
        </FormControl>
      </Box>
      <Grid2 container spacing={1}>
        <FormGroup>
          {/* <FormControl variant="standard"> */}
          <Grid2>
            <TextField margin='dense' label="Search" onChange={searchFieldChange} />
            <FormControlLabel control={
                <Checkbox checked={searchCaseSensitive}
                onChange={() => setSearchCaseSensitive(!searchCaseSensitive)}
              />} label="Case Sensitive" />
          </Grid2>
          {/* </FormControl> */}
        </FormGroup>
          <Grid2>
            <InputLabel margin='dense' id="sort-label">Sort By</InputLabel>
            <Select margin='dense'
              labelId="sort-select-label"
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortAndFilterLabels)}
              label="Sort By"
            >
              <MenuItem value={SortAndFilterLabels.None}>None</MenuItem>
              <MenuItem value={SortAndFilterLabels.Priority}>Priority</MenuItem>
              <MenuItem value={SortAndFilterLabels.DueDate}>Due Date</MenuItem>
              <MenuItem value={SortAndFilterLabels.Tags}>Tags</MenuItem>
            </Select>
          </Grid2>
          <Grid2>
            <FormControlLabel control={
              <Switch checked={sortOrder === 'asc'} 
                disabled={sortBy === SortAndFilterLabels.None}
                onChange={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}/>}
                label="Sort Ascending" />
          </Grid2>
          <Grid2>
            <InputLabel id="filter-label">Filter</InputLabel>
            <Select
              labelId="filter-select-label"
              id="filter-select"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as SortAndFilterLabels)}
              label="Filter By"
            >
              <MenuItem value="None">None</MenuItem>
              <Divider />
              <MenuItem value="incomplete">Incomplete</MenuItem>
              <MenuItem value="complete">Completed</MenuItem>
              <Divider />
              <MenuItem value={1}>Priority 1</MenuItem>
              <MenuItem value={2}>Priority 2</MenuItem>
              <MenuItem value={3}>Priority 3</MenuItem>
              <Divider />
              <MenuItem value={"overdue"}>Overdue</MenuItem>
              <MenuItem value={"today"}>Due Today</MenuItem>
              <MenuItem value={"week"}>Due This Week</MenuItem>
              <MenuItem value={"month"}>Due This Month</MenuItem>
            </Select>
          </Grid2>
      </Grid2>
      <Grid2 container>
        <FormGroup>
          <Grid2>
            <List className='todo-list'>
              {filteredTodos}
            </List>
          </Grid2>
        </FormGroup>
      </Grid2>
      <Snackbar open={alert.show} autoHideDuration={ALERT_TIMEOUT * 1000}
        onClose={(event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
          if (reason === 'clickaway') { return;}
          setAlert({...alert, show: false});
        }}>
        <Alert
          icon={<CheckIcon fontSize="inherit" />}
          severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  )

  return (
    <React.Fragment>
        {toItemDetail ? <Redirect to={`${match.url}/${toItemDetail}`} /> : '' }
        <RouterSwitch>
          <Route exact path={match.path}>
            {listView}
          </Route>
          <Route path={`${match.path}/:id`}>
            <TodoItemDetail todos={todos} />
          </Route>
        </RouterSwitch>
    </React.Fragment>
  )
}

export default TodoList;

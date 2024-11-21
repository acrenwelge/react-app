import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Checkbox, Divider, FormControl, FormControlLabel, FormGroup, Grid2, InputLabel, MenuItem, Select, Switch, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import List from '@mui/material/List';
import Modal from '@mui/material/Modal';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import React, { useEffect, useRef, useState } from 'react';
import {
  Link,
  Redirect,
  Route,
  Switch as RouterSwitch, useLocation, useRouteMatch
} from 'react-router-dom';
import updateServer from './todoApi';
import TodoItem from './TodoItem';
import TodoItemDetail from './TodoItemDetail';
import './todoList.css';
import { BatchedTodo, Item, OperationType } from './todoTypes';

dayjs.extend(isBetween);

// Code will attempt to update server with changes every TIMEOUT seconds
// OR when the number of batched 'todos' updated equals BATCH_SIZE
const BATCH_SIZE = 5;
const TIMEOUT = 3;

interface TodoListProps {
  todos: Item[];
  tags: Set<string>;
  onUpdateTodos: (todos: Item[]) => void;
  triggerAlert: (message: string, severity: string) => void;
}

function TodoList(props: TodoListProps) {
  const {todos, tags, onUpdateTodos, triggerAlert} = props;
  const [toItemDetail, setToItemDetail] = useState<string | null>(null);
  const [newItemAdded, setNewItemAdded] = useState(false); // Used to focus on the new item
  const [modalOpen, setModalOpen] = useState(false);
  const lastTodoItemRef: React.MutableRefObject<HTMLInputElement | null> = useRef(null);
  let match = useRouteMatch();

  /** Focuses on new item when added so it can be edited */
  useEffect(() => {
    if (newItemAdded && lastTodoItemRef.current) {
      lastTodoItemRef.current.click();
      setNewItemAdded(false);
    }
  }, [newItemAdded]);

  let addItemBtnClick = (e: React.MouseEvent) => {
      e.persist();
      addItem(getNewBlankItem());
    }

  let addItem = (item: Item) => {
      let newTodoList: Item[] = todos.slice();
      const newbatchedTodoItem: BatchedTodo = {
        ...item,
        operation_type: OperationType.Add
      };
      setBatchedTodos((batch) => {
        return batch.concat(newbatchedTodoItem);
      });
      newTodoList.push(item);
      setNewItemAdded(true);
      onUpdateTodos(todos);
    }

  let priorityChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    e.persist();
    console.log('Priority change:', e.target.value);
    let newPriority: number | null = Number(e.target.value);
    if (newPriority === 0 || newPriority > 3) {
      newPriority = null;
    }
    const todoItem = todos.find(todo => todo._id === id);
    if (todoItem!.priority === newPriority) { return; }
    todoItem!.priority = newPriority;
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
    const newTodos = todos.map((todo: Item) => {
      if (todo._id === id) {
        return {
          ...todo,
          priority: newPriority
        }
      } else {
        return todo;
      }
    });
    onUpdateTodos(newTodos);
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
    onUpdateTodos(todos.filter(todo => !todo.completed));
  }

  const updateTodoItem = (id: string, updatedFields: Partial<Item>) => {
    const newTodos = todos.map(todo => {
      if (todo._id === id) {
        const updatedTodo = { ...todo, ...updatedFields };
        const batchTodo = batchedTodos.find(todo => todo._id === id);
        if (batchTodo) {
          Object.assign(batchTodo, updatedFields);
        } else {
          setBatchedTodos(batch => batch.concat({
            ...updatedTodo,
            operation_type: OperationType.Update
          }));
        }
        return updatedTodo;
      }
      return todo;
    });
    onUpdateTodos(newTodos);
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
    // as long as the current item text field is not empty (prevents adding empty todos)
    if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim() !== '') {
      if (e.shiftKey) {
        e.preventDefault();
        toggleCompleted(id);
      } else if (e.ctrlKey) {
        e.preventDefault();
        setToItemDetail(id);
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
      setToItemDetail(null);
    }
  }, [location]);

  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [batchedTodos, setBatchedTodos] = useState<BatchedTodo[]>([]);

  const handleHttpResponses = (responses: Response[]) => {
    setBatchedTodos([]);
    if (responses.every((r) => r.ok)) {
      triggerAlert('success','Changes saved' );
    } else {
      triggerAlert('error','Error updating server');
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
        updateServer(batchedTodos)
          .then(handleHttpResponses)
          .catch((error) => {
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
    onUpdateTodos(todos.filter(todo => todo._id !== id));
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
          ref={idx === todos.length - 1 ? lastTodoItemRef : null}
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
    <Grid2 container spacing={1} >
      <Grid2 size={12} display='flex' alignItems='center' justifyContent='center'>
        <h1>My Todos</h1>
      </Grid2>
      <Grid2 size={12} display='flex' alignItems='center' justifyContent='center'>
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
      </Grid2>
      <Grid2 size={12} display='flex' justifyContent='space-evenly'>
        <Link to="/todos"><Button color='secondary'>List View</Button></Link>
        <Link to="/todos"><Button color="secondary">Card View</Button></Link>
        <Link to={`/todos/${todos[0]?._id}`}><Button color='secondary'>Detail View</Button></Link>
        <Link to="/todos"><Button color="secondary">Calendar View</Button></Link>
      </Grid2>
      <Grid2 size={{xs: 12, sm: 6, lg: 4}}>
        <FormGroup>
          <TextField margin='dense' label="Search" onChange={searchFieldChange} />
          <FormControlLabel control={
              <Checkbox checked={searchCaseSensitive}
              onChange={() => setSearchCaseSensitive(!searchCaseSensitive)}
            />} label="Case Sensitive" />
        </FormGroup>
      </Grid2>
      <Grid2 size={{xs: 12, sm: 6, lg: 4}}>
        <FormGroup>
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
          <FormControlLabel control={
            <Switch checked={sortOrder === 'asc'} 
              disabled={sortBy === SortAndFilterLabels.None}
              onChange={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}/>}
              label="Sort Ascending" />
        </FormGroup>
      </Grid2>
      <Grid2 size={{xs: 12, sm: 6, lg: 4}}>
        <FormGroup>
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
        </FormGroup>
      </Grid2>
      <Grid2 size={12} display='flex' alignItems='center' justifyContent='center'>
        <FormGroup>
          <Grid2>
            <List className='todo-list'>
              {filteredTodos}
            </List>
          </Grid2>
        </FormGroup>
      </Grid2>
      <Grid2 size={12} display='flex' alignItems='center' justifyContent='center'>
        <FormControl>
          <Fab
            color="primary"
            variant='extended'
            data-testid="add-item"
            aria-label="add"
            onClick={addItemBtnClick}>
            <AddIcon />
            Add New
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
      </Grid2>
      
    </Grid2>
  )

  return (
    <React.Fragment>
        {toItemDetail ? <Redirect to={`${match.url}/${toItemDetail}`} /> : '' }
        <RouterSwitch>
          <Route exact path={match.path}>
            {listView}
          </Route>
          <Route path={`${match.path}/:id`}>
            <TodoItemDetail todos={todos} updateTodos={updateTodoItem} tagOptions={Array.from(tags)}/>
          </Route>
        </RouterSwitch>
    </React.Fragment>
  )
}

export default TodoList;

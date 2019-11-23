import React from 'react';
import ReactDOM from 'react-dom';
import Board from './board.js';
import Clock from './clock.js';
import { TodoList, TodoItem } from './TodoList.js';

import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/button';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import './index.css';

class GameForm extends React.Component {
  render() {
    const form = (
      <form onSubmit={this.props.startGame} >
        <TextField
          name="p1"
          label="Player 1 Name"
          margin="normal"
          fullWidth
          onChange={this.props.handleFormChange}
        />
        <TextField
          name="p2"
          label="Player 2 Name"
          margin="normal"
          fullWidth
          onChange={this.props.handleFormChange}
        />
      <FormGroup row>
        <FormControlLabel
          control={
            <Checkbox checked={this.props.p1isX} onChange={this.props.toggleXOrO} />
          }
          label="Player 1 is X"
          color="secondary"
        />
      </FormGroup>
      <FormGroup row>
        <Button
          type="submit" variant="contained"
          color="primary" id="game-form-submit">
          Start!
        </Button>
      </FormGroup>
      </form>
    )
    const text = `${this.props.p1} vs ${this.props.p2}`;
    return this.props.displayForm ? form : text;
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        move: [],
      }],
      stepNumber: 0,
      xIsNext: true,
      p1: null,
      p2: null,
      p1IsX: true,
      gameStarted: false,
      display: {
        form: false,
        game: false,
        clock: true,
        todo: true,
      },
      todos: [
        {
          id: 1,
          text: 'Item 1',
          completed: false
        },
        {
          id: 2,
          text: 'Item 2',
          completed: true
        },
        {
          id: 3,
          text: 'Item 3',
          completed: false
        }]
    }
  }

  startGame(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      gameStarted: true,
      display: {
        form: false,
        game: true,
        clock: true,
        todo: false,
      }
    });
  }

  handleFormChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  toggleXOrO = (e) => {
    this.setState((state) => {
      return {
        p1IsX: !state.p1IsX
      }
    });
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[this.state.stepNumber];
    const squares = current.squares.slice();
    const [x,y] = convertToCoords(i);
    if (calculateWinner(squares) != null || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState((state, props) => ({
        history: history.concat([
          {
            squares: squares,
            move: [x, y],
          }
        ]),
        stepNumber: history.length,
        xIsNext: !state.xIsNext,
        p1: null,
        p2: null,
      }));
  }

  jumpTo(step) {
    this.setState((state, props) => ({
      stepNumber: step,
      history: state.history.slice(0, step + 1),
      xIsNext: (step % 2) === 0
    }));
  }

  sortHistoryOrder() {
    this.setState((state, props) => {
      let newOrder = state.history.slice(0, state.history.length);
      newOrder.reverse();
      return {
        history: newOrder
      };
    });
  }

  editItem = (e) => {
    e.persist();
    this.setState(state => {
      for (let i=0; i < state.todos.length; i++) {
        const todo = state.todos[i];
        if (todo.id === Number(e.target.id)) {
          let firstHalf = state.todos.slice(0,i);
          let secondHalf = state.todos.slice(i+1,state.todos.length);
          const newItem = {
            id: todo.id,
            text: e.target.value,
            completed: todo.completed
          };
          return {
            todos: firstHalf.concat([newItem]).concat(secondHalf)
          }
        }
      }
    });
  }

  toggleCompletedEvent = (e) => {
    const id = e.target.value;
    this.toggleCompleted(id);
  }

  toggleCompleted(id) {
    this.setState(state => {
      const newList = state.todos.map((el, idx) => {
        if (el.id === Number(id)) {
          return {
            id: Number(id),
            text: el.text,
            completed: !el.completed
          }
        }
        return el;
      });
      return {
        todos: newList
      }
    });
  }

  addItemBtnClick = (e) => {
    e.persist();
    this.setState(state => {
      let todos = state.todos.slice(0,state.todos.length);
      let maxId = this.getMaxId();
      todos.push({
        id: maxId + 1,
        text: e.target.value,
        completed: false,
      });
      return {
        todos
      }
    });
  }

  addItem = (item) => {
    this.setState(state => {
      let todos = state.todos.slice(0,state.todos.length);
      todos.push({
        id: item.id,
        text: item.text,
        completed: item.completed,
      });
      return {
        todos
      }
    });
  }

  getMaxId() {
    const todos = this.state.todos.slice(0,this.state.todos.length);
    let maxId = 0;
    for (let todo of todos) {
      if (todo.id > maxId) maxId = todo.id;
    }
    return maxId;
  }

  removeCompleted = (e) => {
    e.persist();
    this.setState(state => {
      const todos = state.todos.filter(todo => {
        if (!todo.completed) {
          return true;
        }
        return false;
      });
      return {
        todos
      }
    })
  }

  todoTextKeyInput = (e) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        this.toggleCompleted(e.target.id);
      } else {
        this.addItem({
          id: this.getMaxId() + 1,
          text: '',
          completed: false
        });
      }
    }
  }

  toggleDisplays = (component) => {
    this.setState(state => {
      let { ...displaySettings } = state.display;
      displaySettings[component] = !displaySettings[component];
      return {
        display: displaySettings
      }
    })
  }

  render() {
    const history = this.state.history;
    const current = history[history.length-1];
    const win  = calculateWinner(current.squares);

    let status;
    if (win && win.winner != null) {
      status = `The winner is ${win.winner}`;
    } else if (win && win.winner == null) {
      status = "The game is a draw!";
    } else {
      status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
    }

    const moves = history.map((step, move) => {
      const [x,y] = step.move;
      const desc = move ?
        `Go to move # ${move} (${x},${y})` :
        'Go to game start';
      const last = move === history.length - 1;
      if (!last) {
        return (
          <li key={move}>
            <Button onClick={() => this.jumpTo(move)}>{desc}</Button>
          </li>
        );
      } else {
        return (
          <li key={move}>
            <Button onClick={() => this.jumpTo(move)}><strong>{desc}</strong></Button>
          </li>
        )
      }
    });

    const GameBoardContainer = (
      <Container maxWidth="sm">
        <h1>{(this.state.p1 != null && this.state.p2 != null) ? <span>{this.state.p1} vs {this.state.p2}</span> : null}</h1>
        <div className="game-board">
          <Board
            squares = {current.squares}
            winObj = {win}
            onClick = {(i) => this.handleClick(i)}
            />
        </div>
        <div className="App-info">
          <div><Button onClick={() => this.sortHistoryOrder()}>Sort history order</Button></div>
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
    </Container>);

    const FormContainer = (
        <GameForm
          p1isX={this.state.p1IsX}
          p1={this.state.p1}
          p2={this.state.p2}
          startGame={() => this.startGame()}
          handleFormChange={this.handleFormChange}
          displayForm={this.state.display.form}
          />
    );

    const TodoContainer = (
      <TodoList
        addItem={this.addItemBtnClick}
        removeCompleted={this.removeCompleted}
        >
        {this.state.todos.map((entry, idx) => {
          return (
            <TodoItem
              item={entry}
              key={entry.id}
              id={entry.id}
              onChange={this.editItem}
              onToggle={this.toggleCompletedEvent}
              onKeyDown={this.todoTextKeyInput}
              />
          )
        })}
      </TodoList>
    )

    return (
      <Grid container direction="column" alignItems="center" spacing={3}>
        <Grid item xs={3}>
          {this.state.display.clock && <Clock />}
        </Grid>
        <Grid item xs={3}>
          <FormControlLabel
            control={
              <Checkbox
              checked={this.state.display.clock}
              onChange={() => this.toggleDisplays('clock')}
              />
            }
            label={"clock"}
            />
          <FormControlLabel
            control={
              <Checkbox
              checked={this.state.display.game}
              onChange={() => this.toggleDisplays('game')}
              />
            }
            label={"tic-tac-toe"}
            />
          <FormControlLabel
            control={
              <Checkbox
              checked={this.state.display.todo}
              onChange={() => this.toggleDisplays('todo')}
              />
            }
            label={"todos"}
            />
        </Grid>
        <Grid item xs={3}>
          {this.state.display.form && FormContainer}
        </Grid>
        <Grid item xs={3}>
          {this.state.display.game && GameBoardContainer}
        </Grid>
        <Grid item xs={3}>
          {this.state.display.todo && TodoContainer}
        </Grid>
      </Grid>
    );
  }
}

function convertToCoords(i) {
    let x = i % 3;
    let y = Math.floor(i/3);
    return [x,y];
  }

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winSquares: [a, b, c]
      }
    }
  }
  if (!squares.includes(null)) {
    return {
      winner: null // draw!
    }
  }
  return null;
}

// ========================================

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

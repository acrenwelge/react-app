import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter, useRouteMatch } from 'react-router-dom';
import TodoList from './TodoList';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useRouteMatch: jest.fn(),
}));

beforeAll(() => {
  useRouteMatch.mockReturnValue({ path: '/test-path', url: '/test-url' });
});

test('renders TodoList', () => {
  render(
    <BrowserRouter>
      <TodoList />
    </BrowserRouter>
  );
  expect(screen.getByText('My Todos')).toBeInTheDocument();
});

test('renders empty message when no todos', () => {
  render(
    <BrowserRouter>
      <TodoList todos={[]} />
    </BrowserRouter>
  );
  expect(screen.getByText('No todos available')).toBeInTheDocument();
});

test('renders a list of todos', () => {
  const todos = [
    { id: 1, text: 'Learn React' },
    { id: 2, text: 'Write Tests' },
  ];

  render(
    <BrowserRouter>
      <TodoList todos={todos} />
    </BrowserRouter>
  );

  expect(screen.getByText('Learn React')).toBeInTheDocument();
  expect(screen.getByText('Write Tests')).toBeInTheDocument();
});

test('renders a todo item with a delete button', () => {
  const todos = [{ id: 1, text: 'Learn React' }];

  render(
    <BrowserRouter>
      <TodoList todos={todos} />
    </BrowserRouter>
  );

  expect(screen.getByText('Learn React')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
});

test('calls delete function when delete button is clicked', () => {
  const todos = [{ id: 1, text: 'Learn React' }];
  const handleDelete = jest.fn();

  render(
    <BrowserRouter>
      <TodoList todos={todos} onDelete={handleDelete} />
    </BrowserRouter>
  );

  screen.getByRole('button', { name: /delete/i }).click();
  expect(handleDelete).toHaveBeenCalledWith(1);
});

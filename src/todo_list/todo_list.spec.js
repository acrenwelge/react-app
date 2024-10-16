import { render } from '@testing-library/react';
import React from 'react';
import { BrowserRouter, useRouteMatch } from 'react-router-dom';
import TodoList from './todo_list';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useRouteMatch: jest.fn(),
}));

test('renders TodoList', () => {
  useRouteMatch.mockReturnValue({ path: '/test-path', url: '/test-url' });

  render(
    <BrowserRouter>
      <TodoList />
    </BrowserRouter>
  );
});
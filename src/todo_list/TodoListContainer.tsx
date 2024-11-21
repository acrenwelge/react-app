import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import TodoList from './TodoList';
import { Item, ItemAPI } from './todoTypes';

function TodoListContainer(props: { triggerAlert: (message: string, severity: string) => void; }) {
  const [todos, setTodos] = useState<Item[]>([]);
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodos = async () => {
      console.log('Fetching todos...');
      try {
        const baseURL = process.env.REACT_APP_BASE_URL;
        console.log('Fetching todos from:', `${baseURL}/todos`);
        const response = await axios.get(`${baseURL}/todos`);
        if (response.status > 399) {
          console.error('Failed to fetch todos:', response.statusText);
          throw new Error(`Failed to fetch todos: ${response.statusText}`);
        }
        const rawTodos: ItemAPI[] = response.data;
        let foundTags = new Set<string>();
        let parsedTodos: Item[] = [];
        for (const todo of rawTodos) {
          if (todo.tags) {
            for (const tag of todo.tags) {
              foundTags.add(tag);
            }
          }
          const parsedTodo = { ...todo, dueDate: todo.dueDate ? dayjs(todo.dueDate) : undefined };
          parsedTodos.push(parsedTodo);
        }
        console.log('Fetched todos:', parsedTodos);
        updateTodos(parsedTodos);
        setTags(foundTags);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching todos:', error);
        setError(error as string);
        setLoading(false);
      }
    };
    fetchTodos();
  }, []);

  const updateTodos = (newTodos: Item[]) => {
    setTodos(newTodos);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <TodoList todos={todos} onUpdateTodos={updateTodos} tags={tags} triggerAlert={props.triggerAlert} />;
}

export default TodoListContainer;
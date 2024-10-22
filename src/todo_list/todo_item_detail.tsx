import React from 'react';
import { useParams } from 'react-router-dom';

export interface Item {
  id: number;
  text: string;
  completed: boolean;
  priority: number | null;
}

interface TodoItemDetailProps {
  todos: Item[];
}

function TodoItemDetail(props: TodoItemDetailProps) {
  let { id } = useParams<{ id: string }>();
  const todoId = Number(id);
  const todo = props.todos.find(todo => todo.id === todoId);

  if (!todo) {
    return <div data-testid='item-detail'>Todo item not found</div>;
  }

  return (
    <div data-testid='item-detail'>
      <div>
        ID: {todo.id}
      </div>
      <div>
        Task: {todo.text}
      </div>
      <div>
        Completed: {todo.completed ? 'Yes' : 'No'}
      </div>
      <div>
        Priority: {todo.priority ? todo.priority : 'N/A'}
      </div>
    </div>
  );
}

export default TodoItemDetail;

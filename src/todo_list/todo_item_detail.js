import React from 'react';
import { useParams } from 'react-router-dom';

function TodoItemDetail(props) {
  let { id } = useParams();
  // explicit typing
  id = Number(id);

  let find = (byId) => {
    for (let todo of props.todos) {
      if (todo.id === byId) {
        return todo;
      }
    }
  }

  const todo = find(id);

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
  )
}

export default TodoItemDetail;

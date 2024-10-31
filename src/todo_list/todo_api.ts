import { baseURL } from '..';
import { batchedTodo, Item, OperationType } from './todo_types';

const httpHeaders = {
  'Content-Type': 'application/json',
};

const updateServer = async (batch: batchedTodo[]) => {
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

export default updateServer;
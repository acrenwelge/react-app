import { BatchedTodo, Item, OperationType } from './todoTypes';

const httpHeaders = {
  'Content-Type': 'application/json',
};

const baseURL = process.env.REACT_APP_API_URL;

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
        let action = 'updating';
        if (method === OperationType.Add) {
          action = 'sending new';
        } else if (method === OperationType.Delete) {
          action = 'deleting';
        }
        console.error(`Error ${action} todos to the server:`, error);
      }
    }
    return Promise.reject(new Error('No pending todo changes to send'));
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
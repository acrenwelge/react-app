import dayjs from "dayjs";

export interface SubItem {
  text: string;
  completed: boolean;
}

export interface Item {
  _id: string;
  text: string;
  completed: boolean;
  priority: number | null;
  dueDate?: dayjs.Dayjs;
  tags?: string[];
  subtasks?: SubItem[];
}

export enum OperationType {
  Add = 'POST',
  Delete = 'DELETE',
  Update = 'PUT'
}

export interface BatchedTodo extends Item {
  operation_type?: OperationType;
}

export interface ItemAPI extends Omit<Item, 'dueDate'> {
  dueDate?: string;
}
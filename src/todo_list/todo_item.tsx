import { Checkbox, FormGroup, Input, ListItem, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import React, { forwardRef } from "react";

export interface Item {
  id: number;
  text: string;
  completed: boolean;
  priority: number | null;
  dueDate?: dayjs.Dayjs;
}

interface TodoItemProps {
  item: Item;
  onCompletionToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>, id: number) => void;
  onItemTextChange: (event: React.ChangeEvent<HTMLInputElement>, id: number) => void;
  onItemPriorityChange: (event: React.ChangeEvent<HTMLInputElement>, id: number) => void;
  onItemDueDateChange: (date: dayjs.Dayjs | null, id: number) => void;
}

const TodoItem = forwardRef<HTMLInputElement, TodoItemProps>((props, ref) => {
  const { item, onCompletionToggle, onKeyDown, onItemTextChange, onItemPriorityChange, onItemDueDateChange } = props;

  return (
    <ListItem>
      <FormGroup row>
        <Checkbox checked={item.completed}
          onChange={onCompletionToggle}
          value={item.id}
          tabIndex={item.id * 3}
          />
        <Input type="text"
          multiline
          tabIndex={item.id * 3 + 1}
          value={item.text}
          readOnly={item.completed}
          className={`${item.completed ? 'item-done' :''} priority-${item.priority}`}
          inputProps={{ className: `${item.completed ? 'item-done' :''}`}}
          ref={ref}
          onKeyDown={(e) => onKeyDown(e as React.KeyboardEvent<HTMLInputElement>, item.id)}
          onChange={(e) => onItemTextChange(e as React.ChangeEvent<HTMLInputElement>, item.id)}
          />
        <TextField type="number"
          label="priority"
          tabIndex={item.id * 3 + 2}
          value={item.priority ?? ''}
          inputProps={
            {min: 1, max: 3}
          }
          onChange={(e) => onItemPriorityChange(e as React.ChangeEvent<HTMLInputElement>,item.id)}
          />
        <DatePicker
          label="Due Date"
          value={item.dueDate || null}
          onChange={(val, ctx) => {
            if (!ctx.validationError) {
              onItemDueDateChange(val, item.id)
            }
          }}
          />
      </FormGroup>
    </ListItem>
  )
});

export default TodoItem;
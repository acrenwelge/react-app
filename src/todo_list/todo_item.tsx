import { Autocomplete, Checkbox, FormGroup, Input, ListItem, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import React, { forwardRef } from "react";
import { Item } from "./todo_types";

interface TodoItemProps {
  item: Item;
  tagOptions: string[];
  onTagUpdate: (newTags: string[], id: string) => void;
  onCompletionToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>, id: string) => void;
  onItemTextChange: (event: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  onItemPriorityChange: (event: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  onItemDueDateChange: (date: dayjs.Dayjs | null, id: string) => void;
  onDelete: (id: string) => void;
}

const TodoItem = forwardRef<HTMLInputElement, TodoItemProps>((props, ref) => {
  const { item, tagOptions, onTagUpdate, 
    onCompletionToggle, onKeyDown, onItemTextChange,
    onItemPriorityChange, onItemDueDateChange } = props;

  return (
    <ListItem>
      <FormGroup row>
        <Checkbox checked={item.completed}
          onChange={onCompletionToggle}
          value={item._id}
          //tabIndex={item._id * 3}
          />
        <Input type="text"
          multiline
          // tabIndex={item._id * 3 + 1}
          value={item.text}
          placeholder="Enter task here"
          readOnly={item.completed}
          className={`${item.completed ? 'item-done' :''} priority-${item.priority}`}
          inputProps={{ className: `${item.completed ? 'item-done' :''}`}}
          ref={ref}
          onKeyDown={(e) => onKeyDown(e as React.KeyboardEvent<HTMLInputElement>, item._id)}
          onChange={(e) => onItemTextChange(e as React.ChangeEvent<HTMLInputElement>, item._id)}
          />
        <TextField type="number"
          label="priority"
          // tabIndex={item._id * 3 + 2}
          value={item.priority ?? ''}
          inputProps={
            {min: 1, max: 3}
          }
          onChange={(e) => onItemPriorityChange(e as React.ChangeEvent<HTMLInputElement>,item._id)}
          />
        <DatePicker
          sx={{minWidth: '50px', maxWidth: '150px'}}
          label="Due Date"
          value={item.dueDate || null}
          onChange={(val, ctx) => {
            if (!ctx.validationError) {
              onItemDueDateChange(val, item._id)
            }
          }}
        />
        <Autocomplete
          multiple
          freeSolo
          size="small"
          id="tags-standard"
          options={tagOptions ?? []}
          value={item.tags || undefined}
          sx={{width: '150px'}}
          onChange={(e, tags) => onTagUpdate(tags, item._id)}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              label="Tags"
            />
            )}
        />
        {/* <Fab
          color="secondary"
          size="small"
          aria-label="delete"
          onClick={() => props.onDelete(item._id)}>
          <Delete />
        </Fab> */}
      </FormGroup>
    </ListItem>
  )
});

export default TodoItem;
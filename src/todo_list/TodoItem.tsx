import { Autocomplete, Checkbox, FormGroup, ListItem, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import React, { forwardRef } from "react";
import { Item } from "./todoTypes";

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
    <ListItem dense disableGutters>
      <FormGroup row>
        <Checkbox checked={item.completed}
          onChange={onCompletionToggle}
          value={item._id}
          />
        <TextField type="text"
          data-testid="item-text"
          variant="outlined"
          multiline
          value={item.text}
          placeholder="Enter task here"
          className={`${item.completed ? 'item-done' :''} priority-${item.priority}`}
          slotProps={{htmlInput: { className: `${item.completed ? 'item-done' :''}`}}}
          ref={ref}
          onKeyDown={(e) => onKeyDown(e as React.KeyboardEvent<HTMLInputElement>, item._id)}
          onChange={(e) => onItemTextChange(e as React.ChangeEvent<HTMLInputElement>, item._id)}
          />
        <TextField type="number"
          label="priority"
          value={item.priority ?? ''}
          slotProps={
            {htmlInput: {min: 0, max: 4}}
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
          options={tagOptions ?? []}
          value={item.tags || undefined}
          sx={{width: '250px'}}
          onChange={(e, tags) => onTagUpdate(tags, item._id)}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Tags"
            />
            )}
        />
      </FormGroup>
    </ListItem>
  )
});

export default TodoItem;
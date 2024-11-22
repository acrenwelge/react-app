import { FormGroup, Grid2, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import React from 'react';

interface SettingsProps {
  fontSize: string;
  palette: string;
  onFontSizeChange: (fontSize: string) => void;
  onPaletteChange: (colorScheme: string) => void;
}

const Settings: React.FC<SettingsProps> = (props) => {

  const handleFontSizeChange = (event: SelectChangeEvent<string>) => {
    props.onFontSizeChange(event.target.value);
  };

  const handleColorSchemeChange = (event: SelectChangeEvent<string>) => {
    props.onPaletteChange(event.target.value);
  };

  return (
    <Grid2 container display="flex" justifyContent="center" alignItems="center">
      <Grid2 size={{xl: 3}}>
        <h2>Settings</h2>
        <FormGroup>
          <InputLabel id="font-size-select">Font Size</InputLabel>
          <Select
            labelId="font-size-select"
            id="font-size"
            value={props.fontSize}
            onChange={handleFontSizeChange}
          >
            <MenuItem value={'small'}>Small</MenuItem>
            <MenuItem value={'normal'}>Normal</MenuItem>
            <MenuItem value={'large'}>Large</MenuItem>
          </Select>
          <InputLabel id="color-scheme-select">Color Scheme</InputLabel>
          <Select
            labelId="color-scheme-select"
            id="color-scheme"
            value={props.palette}
            onChange={handleColorSchemeChange}
          >
            <MenuItem value={'light'}>Light</MenuItem>
            <MenuItem value={'dark'}>Dark</MenuItem>
            <MenuItem value={'default'}>Default</MenuItem>
          </Select>
        </FormGroup>
      </Grid2>
    </Grid2>
  );
};

export default Settings;
import React from 'react';
import Grid from '@material-ui/core/Grid';
import Navbar from './navbar.js';

/**
 Container component for rendering pages
**/
export default function PageContent(props) {
  const centered = {
    margin: 'auto',
    width: '100%',
    textAlign: 'center',
  };

  return (
    <Grid container direction="row" justify="center" alignContent="center" alignItems="center" spacing={3}>
      <Grid item xs={10}>
        <Navbar />
      </Grid>
      <Grid style={centered} item xs={6}>
        {props.children}
      </Grid>
    </Grid>
  );
}

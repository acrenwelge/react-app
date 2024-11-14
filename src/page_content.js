import Container from '@mui/material/Container';
import Grid2 from '@mui/material/Grid2';
import React from 'react';
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
    <>
    <Container maxWidth="xl">
      <Grid2 size={12}>
        <Navbar />
      </Grid2>
    </Container>
    {props.children}
    </>
  );
}

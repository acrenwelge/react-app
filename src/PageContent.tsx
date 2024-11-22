import CheckIcon from '@mui/icons-material/Check';
import { Alert, Snackbar, SnackbarCloseReason } from '@mui/material';
import Container from '@mui/material/Container';
import Grid2 from '@mui/material/Grid2';
import React, { useState } from 'react';
import Navbar from './Navbar.js';

/**
 Container component for rendering pages
**/
export default function PageContent(props: any) {
  const ALERT_TIMEOUT = 3;

  enum AlertSeverity {
    Success = 'success',
    Error = 'error'
  }

  const [alert, setAlert] = useState({
    show: false,
    severity: AlertSeverity.Success,
    message: ''
  });

  const triggerAlert = (severity: AlertSeverity, message: string) => {
    setAlert({ show: true, severity, message});
    setTimeout(() => setAlert({...alert, show: false}), ALERT_TIMEOUT * 1000);
  }

  return (
    <>
    <Container maxWidth="xl">
      <Grid2 size={12}>
        <Navbar />
      </Grid2>
    </Container>
    {React.cloneElement(props.children, { triggerAlert })}
    <Snackbar open={alert.show} autoHideDuration={ALERT_TIMEOUT * 1000}
      onClose={(event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
        if (reason === 'clickaway') { return;}
        setAlert({...alert, show: false});
      }}>
      <Alert
        icon={<CheckIcon fontSize="inherit" />}
        severity={alert.severity}
        // severity='success'
      >
        {alert.message}
      </Alert>
    </Snackbar>
    </>
    );
}

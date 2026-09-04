// Umbra — application header.

import React from 'react';
import { AppBar, Box, Typography } from '@mui/material';

/**
 * Application-level header for Umbra.
 */
export const Header: React.FC = () => (
  <AppBar
    position="static"
    data-testid="header"
    sx={{
      backgroundColor: '#000',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        px: { xs: 3, md: 10 },
        py: 2.2,
      }}
      data-testid="header-logo"
    >
      <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, letterSpacing: 2 }}>
        🌒 UMBRA
      </Typography>
      <Typography variant="caption" sx={{ color: '#a8a8a8' }}>
        verified, anonymous feedback · on Midnight
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', px: { xs: 3, md: 10 }, py: 2.2, alignItems: 'center' }}>
      <img src="/midnight-logo.png" alt="Midnight" height={44} />
    </Box>
  </AppBar>
);

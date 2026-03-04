import type { Preview } from '@storybook/react'
import React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from '../app/lib/theme/mui-theme'
import '../app/globals.css'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: {
        'iPhone SE': {
          name: 'iPhone SE',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        'iPhone Pro': {
          name: 'iPhone Pro',
          styles: {
            width: '390px',
            height: '844px',
          },
        },
        'Galaxy S': {
          name: 'Galaxy S',
          styles: {
            width: '360px',
            height: '800px',
          },
        },
      },
    },
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#F8FAFC',
        },
        {
          name: 'dark',
          value: '#1C1917',
        },
      ],
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Story />
      </ThemeProvider>
    ),
  ],
}

export default preview

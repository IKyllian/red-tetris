import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from 'front/store/store';
import { router } from 'front/router/router';
import 'front/css/rules.css';
import { initSocket } from 'front/store/socket.slice';
import { describe, vi } from 'vitest';
import React from 'react'

const initSocket = vi.fn().mockImplementation(() => () => {});

vi.mock('react-router-dom', () => {
  const actual = vi.importActual('react-router-dom');
  return {
    ...actual,
    RouterProvider: ({ router }: { router: any }) => <div data-testid="router-provider">{router}</div>,
    createBrowserRouter: vi.fn()
  };
});

describe('Main Router', () => {
    beforeAll(() => {
      // Create a mock root element
      const root = document.createElement('div');
      root.id = 'root';
      document.body.appendChild(root);
    });

    it('renders the app correctly', () => {
      store.dispatch(initSocket());

      render(
        <Provider store={store}>
          <RouterProvider router={router} />
        </Provider>,
        { container: document.body.appendChild(document.createElement('div')) }
      );
    
      // Check if the RouterProvider is rendered
      expect(screen.getByTestId('router-provider')).toBeInTheDocument();
    });
})

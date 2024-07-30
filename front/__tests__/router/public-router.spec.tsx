import { beforeEach, describe, vi, expect, it } from "vitest";
import React from "react";
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import PublicRoute from 'front/router/public-route';
import { Navigate } from 'react-router-dom';

vi.mock('react-router-dom', async (importOriginal) => {
    const mod = await importOriginal();
    return {
       ...mod!,
        Navigate: vi.fn(() => null)
    }
})

const mockHeader = vi.fn() 
vi.mock('front/components/header/header', () => ({ 
  default: (props) => {
    mockHeader(props)
    return <div>Mocked Header</div>
  },
}))

const mockStore = configureStore([])

describe('Public Route', () => {
    let store;

    beforeEach(() => {
        store = mockStore({
            player: null
        })
        vi.clearAllMocks();
    })
    it('should render children when player is null', () => {
        const { getByText } = render(
            <Provider store={store}>
                <BrowserRouter>
                <PublicRoute>
                    <div>Public Content</div>
                </PublicRoute>
                </BrowserRouter>
            </Provider>
        );
        expect(getByText('Mocked Header')).toBeInTheDocument();
        expect(getByText('Public Content')).toBeInTheDocument();
        expect(Navigate).not.toHaveBeenCalled();
    })

    it('should navigate to /home when player is not null', () => {
        store = mockStore({
            player: {
                name: 'test',
                id: 'test'
            }
        })
        render(
            <Provider store={store}>
                <BrowserRouter>
                <PublicRoute>
                    <div>Public Content</div>
                </PublicRoute>
                </BrowserRouter>
            </Provider>
        );

        expect(Navigate).toHaveBeenCalledWith({to: '/home'}, {});
    })
})
import { beforeEach, describe, vi, expect, it } from "vitest";
import React from "react";
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import PrivateRoute from 'front/router/private-route';
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

describe('Private Route', () => {
    let store;

    beforeEach(() => {
        store = mockStore({
            player: null
        })
        vi.clearAllMocks();
    })

    it('should navigate to / when player is null', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                <PrivateRoute>
                    <div>Private Content</div>
                </PrivateRoute>
                </BrowserRouter>
            </Provider>
        );

        expect(Navigate).toHaveBeenCalledWith({to: '/'}, {});
    })

    it('should render children when player is not null', () => {
        store = mockStore({
            player: {
                name: 'test',
                id: 'test'
            }
        })
        const { getByText } = render(
            <Provider store={store}>
                <BrowserRouter>
                <PrivateRoute>
                    <div>Private Content</div>
                </PrivateRoute>
                </BrowserRouter>
            </Provider>
        );
        expect(getByText('Mocked Header')).toBeInTheDocument();
        expect(getByText('Private Content')).toBeInTheDocument();
        expect(Navigate).not.toHaveBeenCalled();
    })  
})
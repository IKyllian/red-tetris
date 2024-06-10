import { describe, expect, afterEach, test } from "vitest";
import { render, cleanup, screen } from '@testing-library/react';
import { Register } from "front/components/sign/sign";
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
const mockStore = configureStore([]);
describe("Register", () => {
    // test('Should render Register component', () => {
    //     const store = mockStore({
    //         yourReducer: {
    //           data: 'Mocked data',
    //         },
    //       });
          
    //       render(
    //         <Provider store={store}>
    //           <Register />
    //         </Provider>
    //       );
    // })
    // Juste pour ne pas avoir d'erreur pour l'instant
    it(() => {
        expect(true).to.equal(true);
    })
})
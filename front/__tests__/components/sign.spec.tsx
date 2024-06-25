import { describe, expect, afterEach, test, beforeEach, Mock, vi, it } from "vitest";
import { render, cleanup, screen, findByTestId, fireEvent, act } from '@testing-library/react';
import Register from "front/components/sign/sign";
import { useAppDispatch } from "front/store/hook";
import { useNavigate } from "react-router-dom";
import React from 'react'
import { sign } from 'front/store/player.slice';

vi.mock('front/store/hook', () => ({
    useAppDispatch: vi.fn()
}));
  
// Mock the useNavigate hook
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn()
}));

// vi.mock('front/store/player.slice', () => ({
//     sign: vi.fn().mockReturnValue({ type: 'player/sign', payload: 'Test' })
// }));

describe("Register Component", () => {
    const mockNavigate = vi.fn();
    const mockDispatch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as Mock).mockReturnValue(mockNavigate);
        (useAppDispatch as Mock).mockReturnValue(mockDispatch);
        vi.clearAllMocks();
    });

    it('Should register the new player', async () => {
        await act(async () => {
            // const { findByTestId } = render(<Register />);
            
            // const submitButton = await findByTestId('submit-button');
            const { findByTestId } = render(<Register />);
            
            const submitButton = await findByTestId('submit-button');
            fireEvent.click(submitButton);
          });
      
        expect(mockDispatch).toHaveBeenCalledWith(sign('Test'));
        expect(mockNavigate).toHaveBeenCalledWith('/home');
    })
})
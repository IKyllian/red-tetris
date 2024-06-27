import { describe, expect, beforeEach, Mock, vi, it } from "vitest";
import { render, fireEvent } from '@testing-library/react';
import Register from "front/components/sign/sign";
import { useAppDispatch } from "front/store/hook";
import { useNavigate } from "react-router-dom";
import React from 'react'
import { sign } from 'front/store/player.slice';
import { useForm } from "react-hook-form";

vi.mock('front/store/hook', () => ({
    useAppDispatch: vi.fn()
}));
  
// Mock the useNavigate hook
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn()
}));

vi.mock('react-hook-form', () => ({
    useForm: vi.fn()
}));

describe("Register Component", () => {
    const mockNavigate = vi.fn();
    const mockDispatch = vi.fn();

    beforeEach(() => {
        (useNavigate as Mock).mockReturnValue(mockNavigate);
        (useAppDispatch as Mock).mockReturnValue(mockDispatch);
        vi.clearAllMocks();
    });

    it('Should render register component without error', async () => {
        const mockHandleSubmit = vi.fn((fn) => (e) => { e.preventDefault(); fn({ name: 'Test' }); });
        (useForm as Mock).mockReturnValue({
            register: vi.fn(),
            handleSubmit: mockHandleSubmit,
            formState: { errors: {} }
        });

        const { findByTestId, getByPlaceholderText } = render(<Register />);
        const name = 'Test'
        const submitButton = await findByTestId('submit-button');
        const formRegister = await findByTestId('form-register');
        const input = getByPlaceholderText('Name');

        fireEvent.change(input, { target: { value: name } });
        fireEvent.submit(submitButton)

        expect(formRegister.children).toHaveLength(2)
        expect(mockDispatch).toHaveBeenCalledWith(sign(name));
        expect(mockNavigate).toHaveBeenCalledWith('/home');
    })
    it('Should render register component with error', async () => {
        const message = 'Name is required';
        const mockHandleSubmit = vi.fn((fn) => (e) => { e.preventDefault(); fn({ name: 'Test' }); });
        (useForm as Mock).mockReturnValue({
            register: vi.fn(),
            handleSubmit: mockHandleSubmit,
            formState: { errors: { name: { message }} }
        });

        const { findByTestId } = render(<Register />);
        const error = await findByTestId('error')

        expect(error).toHaveTextContent(message)
    })
})
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import * as authSlice from '../../Store/auth.slice';
import userEvent from '@testing-library/user-event';

// Mock thunks
vi.mock('../../Store/auth.slice', async () => {
    const actual = await vi.importActual('../../Store/auth.slice');
    return {
        ...actual,
        requestForgotPassword: vi.fn(),
        verifyForgotPassword: vi.fn(),
    };
});

// Mock motion/react
vi.mock('motion/react', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

// Mock sonner
const toastMock = vi.hoisted(() => ({
    error: vi.fn(),
    success: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: toastMock,
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('ForgotPasswordPage', () => {
    let store;

    const createTestStore = (initialState) => {
        return configureStore({
            reducer: {
                auth: (state = initialState, action) => state,
            },
            preloadedState: {
                auth: initialState,
            },
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mock return for thunks
        const mockUnwrap = () => Promise.resolve({});
        authSlice.requestForgotPassword.mockReturnValue((dispatch) => ({ unwrap: mockUnwrap }));
        authSlice.verifyForgotPassword.mockReturnValue((dispatch) => ({ unwrap: mockUnwrap }));
    });

    test('renders email step correctly', () => {
        store = createTestStore({ forgotPasswordStatus: 'idle', error: null });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ForgotPasswordPage />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByRole('heading', { name: /Forgot Password/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Send Reset Code/i })).toBeInTheDocument();
    });

    test('handles email submission', async () => {
        const user = userEvent.setup();
        store = createTestStore({ forgotPasswordStatus: 'idle', error: null });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ForgotPasswordPage />
                </MemoryRouter>
            </Provider>
        );

        await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
        await user.click(screen.getByRole('button', { name: /Send Reset Code/i }));

        expect(authSlice.requestForgotPassword).toHaveBeenCalledWith({
            email: 'test@example.com',
            role: 'student',
        });
        expect(toastMock.success).toHaveBeenCalledWith('OTP sent to your email');

        // Should switch to verify step
        expect(screen.getByRole('heading', { name: /Reset Password/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
    });

    test('handles invalid email', async () => {
        const user = userEvent.setup();
        store = createTestStore({ forgotPasswordStatus: 'idle', error: null });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ForgotPasswordPage />
                </MemoryRouter>
            </Provider>
        );

        await user.type(screen.getByLabelText(/Email/i), 'invalid-email');
        await user.click(screen.getByRole('button', { name: /Send Reset Code/i }));

        // Browser validation prevents submission
        const emailInput = screen.getByLabelText(/Email/i);
        expect(emailInput).toBeInvalid();

        // expect(toastMock.error).toHaveBeenCalledWith('Please enter a valid email address');
        expect(authSlice.requestForgotPassword).not.toHaveBeenCalled();
    });

    test('handles verify submission', async () => {
        const user = userEvent.setup();
        store = createTestStore({ forgotPasswordStatus: 'idle', error: null });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ForgotPasswordPage />
                </MemoryRouter>
            </Provider>
        );

        // First step: Email
        await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
        await user.click(screen.getByRole('button', { name: /Send Reset Code/i }));

        // Second step: Verify
        await user.type(screen.getByLabelText(/Verification Code/i), '123456');
        await user.type(screen.getByLabelText(/^New Password$/i), 'Password123');
        await user.type(screen.getByLabelText(/Confirm Password/i), 'Password123');

        await user.click(screen.getByRole('button', { name: /Reset Password/i }));

        expect(authSlice.verifyForgotPassword).toHaveBeenCalledWith({
            email: 'test@example.com',
            role: 'student',
            otp: '123456',
            newPassword: 'Password123',
        });
        expect(toastMock.success).toHaveBeenCalledWith(expect.stringContaining('Password reset successfully'));
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('validates OTP length', async () => {
        const user = userEvent.setup();
        store = createTestStore({ forgotPasswordStatus: 'idle', error: null });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ForgotPasswordPage />
                </MemoryRouter>
            </Provider>
        );

        // Skip to verify step by mocking state or simulating flow
        await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
        await user.click(screen.getByRole('button', { name: /Send Reset Code/i }));

        await user.type(screen.getByLabelText(/Verification Code/i), '123');
        await user.type(screen.getByLabelText(/^New Password$/i), 'Password123');
        await user.type(screen.getByLabelText(/Confirm Password/i), 'Password123');

        await user.click(screen.getByRole('button', { name: /Reset Password/i }));

        // Browser validation prevents submission because of pattern mismatch
        const otpInput = screen.getByLabelText(/Verification Code/i);
        expect(otpInput).toBeInvalid();

        // expect(toastMock.error).toHaveBeenCalledWith('OTP must be 6 digits');
        expect(authSlice.verifyForgotPassword).not.toHaveBeenCalled();
    });

    test('validates passwords match in verify step', async () => {
        const user = userEvent.setup();
        store = createTestStore({ forgotPasswordStatus: 'idle', error: null });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ForgotPasswordPage />
                </MemoryRouter>
            </Provider>
        );

        // Skip to verify step
        await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
        await user.click(screen.getByRole('button', { name: /Send Reset Code/i }));

        await user.type(screen.getByLabelText(/Verification Code/i), '123456');
        await user.type(screen.getByLabelText(/^New Password$/i), 'Password123');
        await user.type(screen.getByLabelText(/Confirm Password/i), 'Password456');

        await user.click(screen.getByRole('button', { name: /Reset Password/i }));

        expect(toastMock.error).toHaveBeenCalledWith('Passwords do not match');
        expect(authSlice.verifyForgotPassword).not.toHaveBeenCalled();
    });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChangePasswordPage from './ChangePasswordPage';
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
        requestPasswordReset: vi.fn(),
        verifyOtpAndResetPassword: vi.fn(),
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

describe('ChangePasswordPage', () => {
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
        authSlice.requestPasswordReset.mockReturnValue((dispatch) => ({ unwrap: mockUnwrap }));
        authSlice.verifyOtpAndResetPassword.mockReturnValue((dispatch) => ({ unwrap: mockUnwrap }));
    });

    test('renders request step correctly for unauthenticated user', () => {
        store = createTestStore({ passwordResetStatus: 'idle', error: null, isAuthenticated: false });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ChangePasswordPage />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByRole('heading', { name: /Change Password/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Send OTP/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Student/i })).toBeInTheDocument();
    });

    test('renders request step correctly for authenticated user', () => {
        store = createTestStore({ passwordResetStatus: 'idle', error: null, isAuthenticated: true });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ChangePasswordPage />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByRole('heading', { name: /Change Password/i })).toBeInTheDocument();
        expect(screen.queryByLabelText(/Email/i)).not.toBeInTheDocument();
        expect(screen.getByText(/An OTP will be sent to your registered email/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Send OTP/i })).toBeInTheDocument();
    });

    test('handles request submission for unauthenticated user', async () => {
        const user = userEvent.setup();
        store = createTestStore({ passwordResetStatus: 'idle', error: null, isAuthenticated: false });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ChangePasswordPage />
                </MemoryRouter>
            </Provider>
        );

        await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
        await user.click(screen.getByRole('button', { name: /Send OTP/i }));

        expect(authSlice.requestPasswordReset).toHaveBeenCalledWith({
            email: 'test@example.com',
            role: 'student',
        });
        expect(toastMock.success).toHaveBeenCalledWith('OTP sent to your email');

        // Should switch to verify step
        expect(screen.getByRole('heading', { name: /Verify & Change/i })).toBeInTheDocument();
    });

    test('handles request submission for authenticated user', async () => {
        const user = userEvent.setup();
        store = createTestStore({ passwordResetStatus: 'idle', error: null, isAuthenticated: true });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ChangePasswordPage />
                </MemoryRouter>
            </Provider>
        );

        await user.click(screen.getByRole('button', { name: /Send OTP/i }));

        expect(authSlice.requestPasswordReset).toHaveBeenCalledWith({});
        expect(toastMock.success).toHaveBeenCalledWith('OTP sent to your email');

        // Should switch to verify step
        expect(screen.getByRole('heading', { name: /Verify & Change/i })).toBeInTheDocument();
    });

    test('handles verify submission', async () => {
        const user = userEvent.setup();
        store = createTestStore({ passwordResetStatus: 'idle', error: null, isAuthenticated: false });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ChangePasswordPage />
                </MemoryRouter>
            </Provider>
        );

        // First step: Email
        await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
        await user.click(screen.getByRole('button', { name: /Send OTP/i }));

        // Second step: Verify
        await user.type(screen.getByLabelText(/Verification Code/i), '123456');
        await user.type(screen.getByLabelText(/^New Password$/i), 'Password123');
        await user.type(screen.getByLabelText(/Confirm Password/i), 'Password123');

        await user.click(screen.getByRole('button', { name: /Change Password/i }));

        expect(authSlice.verifyOtpAndResetPassword).toHaveBeenCalledWith({
            email: 'test@example.com',
            role: 'student',
            otp: '123456',
            newPassword: 'Password123',
        });
        expect(toastMock.success).toHaveBeenCalledWith('Password changed successfully');
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('handles verify submission for authenticated user', async () => {
        const user = userEvent.setup();
        store = createTestStore({ passwordResetStatus: 'idle', error: null, isAuthenticated: true });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ChangePasswordPage />
                </MemoryRouter>
            </Provider>
        );

        // First step: Request
        await user.click(screen.getByRole('button', { name: /Send OTP/i }));

        // Second step: Verify
        await user.type(screen.getByLabelText(/Verification Code/i), '123456');
        await user.type(screen.getByLabelText(/^New Password$/i), 'Password123');
        await user.type(screen.getByLabelText(/Confirm Password/i), 'Password123');

        await user.click(screen.getByRole('button', { name: /Change Password/i }));

        expect(authSlice.verifyOtpAndResetPassword).toHaveBeenCalledWith({
            otp: '123456',
            newPassword: 'Password123',
        });
        expect(toastMock.success).toHaveBeenCalledWith('Password changed successfully');
        expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    test('validates passwords match in verify step', async () => {
        const user = userEvent.setup();
        store = createTestStore({ passwordResetStatus: 'idle', error: null, isAuthenticated: false });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ChangePasswordPage />
                </MemoryRouter>
            </Provider>
        );

        // Skip to verify step
        await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
        await user.click(screen.getByRole('button', { name: /Send OTP/i }));

        await user.type(screen.getByLabelText(/Verification Code/i), '123456');
        await user.type(screen.getByLabelText(/^New Password$/i), 'Password123');
        await user.type(screen.getByLabelText(/Confirm Password/i), 'Password456');

        await user.click(screen.getByRole('button', { name: /Change Password/i }));

        expect(toastMock.error).toHaveBeenCalledWith('Passwords do not match');
        expect(authSlice.verifyOtpAndResetPassword).not.toHaveBeenCalled();
    });
});

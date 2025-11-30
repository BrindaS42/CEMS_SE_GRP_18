import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from './LoginPage';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import * as authSlice from '../../Store/auth.slice';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

// Mock thunks
vi.mock('../../Store/auth.slice', async () => {
    const actual = await vi.importActual('../../Store/auth.slice');
    return {
        ...actual,
        loginUser: vi.fn(),
        clearError: vi.fn(),
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

describe('LoginPage', () => {
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
        // Setup default mock return for loginUser
        const mockUnwrap = () => Promise.resolve({});
        authSlice.loginUser.mockReturnValue((dispatch) => ({ unwrap: mockUnwrap }));
        authSlice.clearError.mockReturnValue({ type: 'auth/clearError' });
    });

    test('renders login form correctly', () => {
        store = createTestStore({ status: 'idle', error: null, isAuthenticated: false });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <LoginPage />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign In as Student/i })).toBeInTheDocument();
    });

    test('handles input changes', async () => {
        const user = userEvent.setup();
        store = createTestStore({ status: 'idle', error: null, isAuthenticated: false });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <LoginPage />
                </MemoryRouter>
            </Provider>
        );

        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');

        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password123');
    });

    test('submits form with valid credentials', async () => {
        const user = userEvent.setup();
        store = createTestStore({ status: 'idle', error: null, isAuthenticated: false });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <LoginPage />
                </MemoryRouter>
            </Provider>
        );

        await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
        await user.type(screen.getByLabelText(/Password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /Sign In/i }));

        expect(authSlice.loginUser).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
            role: 'student',
        });
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('displays error on failed login', async () => {
        const user = userEvent.setup();
        // Mock login failure
        // Mock login failure
        const mockUnwrap = () => Promise.reject('Invalid credentials');
        // loginUser should return a thunk function (which dispatch calls)
        // or an action object if we weren't using thunks.
        // But the component calls .unwrap() on the result of dispatch.
        // If we mock loginUser to return a simple object, dispatch returns that object (if it has type).
        // But here we want dispatch to return something with .unwrap().
        // The easiest way is to make loginUser return a function (thunk) that returns the object with unwrap.

        const mockThunk = () => (dispatch) => {
            return {
                unwrap: mockUnwrap,
                type: 'auth/loginUser/rejected' // Fake type to satisfy potential checks
            };
        };

        // Wait, if it returns a function, dispatch calls it.
        // The return value of dispatch is the return value of that function.

        authSlice.loginUser.mockReturnValue((dispatch) => {
            return { unwrap: mockUnwrap };
        });

        store = createTestStore({ status: 'idle', error: null, isAuthenticated: false });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <LoginPage />
                </MemoryRouter>
            </Provider>
        );

        await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
        await user.type(screen.getByLabelText(/Password/i), 'wrongpassword');
        await user.click(screen.getByRole('button', { name: /Sign In/i }));

        expect(toastMock.error).toHaveBeenCalledWith('Invalid credentials');
    });

    test('validates empty fields', async () => {
        const user = userEvent.setup();
        store = createTestStore({ status: 'idle', error: null, isAuthenticated: false });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <LoginPage />
                </MemoryRouter>
            </Provider>
        );

        // console.log('Clicking sign in');
        await user.click(screen.getByRole('button', { name: /Sign In/i }));
        // console.log('Clicked sign in');

        // Wait for potential async operations, although validation is synchronous.
        // Maybe the button is disabled?
        // Check if button is enabled.
        const button = screen.getByRole('button', { name: /Sign In/i });
        expect(button).not.toBeDisabled();

        // The inputs have 'required' attribute, so browser validation prevents submission.
        // We can check if the input is invalid.
        const emailInput = screen.getByLabelText(/Email/i);
        expect(emailInput).toBeInvalid();

        // Or we can try to submit by firing submit event directly on form, bypassing browser validation?
        // But userEvent.click(submitButton) should trigger validation.
        // If validation fails, handleSubmit is NOT called.
        // So toast.error is NOT called because it's inside handleSubmit.

        // So we should expect that loginUser is not called.
        expect(authSlice.loginUser).not.toHaveBeenCalled();

    });

    test('switches roles', async () => {
        const user = userEvent.setup();
        store = createTestStore({ status: 'idle', error: null, isAuthenticated: false });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <LoginPage />
                </MemoryRouter>
            </Provider>
        );

        const organizerTab = screen.getByRole('tab', { name: /Organizer/i });
        await user.click(organizerTab);

        expect(screen.getByRole('button', { name: /Sign In as Organizer/i })).toBeInTheDocument();
        expect(authSlice.clearError).toHaveBeenCalled();
    });

    test('redirects if already authenticated', () => {
        store = createTestStore({ status: 'succeeded', error: null, isAuthenticated: true });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <LoginPage />
                </MemoryRouter>
            </Provider>
        );

        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});

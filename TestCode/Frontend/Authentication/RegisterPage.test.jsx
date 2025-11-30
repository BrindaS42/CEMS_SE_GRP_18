import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { RegisterPage } from './RegisterPage';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import * as authSlice from '../../Store/auth.slice';
import * as collegeSlice from '../../Store/college.slice';
import userEvent from '@testing-library/user-event';

// Mock thunks
vi.mock('../../Store/auth.slice', async () => {
    const actual = await vi.importActual('../../Store/auth.slice');
    return {
        ...actual,
        registerUser: vi.fn(),
        clearError: vi.fn(),
    };
});

vi.mock('../../Store/college.slice', async () => {
    const actual = await vi.importActual('../../Store/college.slice');
    return {
        ...actual,
        fetchAllApprovedColleges: vi.fn(),
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

// Mock Select component from shadcn
// Since Select uses Radix UI, it can be tricky to test.
// We can mock it to be a simple select for easier testing.
// However, the component imports Select parts.
// Let's try to test with the real component first, or mock the imports.
// The imports are from '../../Components/ui/select.jsx'.
// Let's mock that module.

vi.mock('../../Components/ui/select.jsx', () => ({
    Select: ({ children, value, onValueChange }) => (
        <select
            data-testid="college-select"
            value={value}
            onChange={e => onValueChange(e.target.value)}
        >
            {children}
        </select>
    ),
    SelectTrigger: ({ children }) => <div>{children}</div>,
    SelectValue: ({ placeholder }) => <span>{placeholder}</span>,
    SelectContent: ({ children }) => <>{children}</>,
    SelectItem: ({ children, value }) => <option value={value}>{children}</option>,
}));

describe('RegisterPage', () => {
    let store;

    const createTestStore = (initialState) => {
        return configureStore({
            reducer: {
                auth: (state = initialState.auth, action) => state,
                college: (state = initialState.college, action) => state,
            },
            preloadedState: initialState,
        });
    };

    const defaultState = {
        auth: { status: 'idle', error: null, isAuthenticated: false },
        college: { list: [{ _id: 'c1', name: 'Test College', code: 'TC' }], status: 'succeeded' },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mock return for registerUser
        const mockUnwrap = () => Promise.resolve({});
        authSlice.registerUser.mockReturnValue((dispatch) => ({ unwrap: mockUnwrap }));
        authSlice.clearError.mockReturnValue({ type: 'auth/clearError' });
        collegeSlice.fetchAllApprovedColleges.mockReturnValue({ type: 'college/fetchAllApprovedColleges' });
    });

    test('renders registration form correctly', () => {
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <RegisterPage />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByRole('heading', { name: /Join CEMS/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/UserName/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
    });

    test('handles input changes', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <RegisterPage />
                </MemoryRouter>
            </Provider>
        );

        await user.type(screen.getByLabelText(/UserName/i), 'John Doe');
        await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123');
        await user.type(screen.getByLabelText('Confirm Password'), 'Password123');

        expect(screen.getByLabelText(/UserName/i)).toHaveValue('John Doe');
        expect(screen.getByLabelText(/Email/i)).toHaveValue('john@example.com');
        expect(screen.getByLabelText('Password')).toHaveValue('Password123');
        expect(screen.getByLabelText('Confirm Password')).toHaveValue('Password123');
    });

    test('validates passwords match', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <RegisterPage />
                </MemoryRouter>
            </Provider>
        );

        await user.type(screen.getByLabelText(/UserName/i), 'John Doe');
        await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123');
        await user.type(screen.getByLabelText('Confirm Password'), 'Password456');

        // Select college
        await user.selectOptions(screen.getByTestId('college-select'), 'c1');

        await user.click(screen.getByRole('button', { name: /Create Account/i }));

        expect(toastMock.error).toHaveBeenCalledWith('Passwords do not match');
        expect(authSlice.registerUser).not.toHaveBeenCalled();
    });

    test('validates password complexity', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <RegisterPage />
                </MemoryRouter>
            </Provider>
        );

        await user.type(screen.getByLabelText(/UserName/i), 'John Doe');
        await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'password');
        await user.type(screen.getByLabelText('Confirm Password'), 'password');

        await user.selectOptions(screen.getByTestId('college-select'), 'c1');

        await user.click(screen.getByRole('button', { name: /Create Account/i }));

        expect(toastMock.error).toHaveBeenCalledWith(expect.stringContaining('Password must contain'));
        expect(authSlice.registerUser).not.toHaveBeenCalled();
    });

    test('submits form with valid data', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <RegisterPage />
                </MemoryRouter>
            </Provider>
        );

        await user.type(screen.getByLabelText(/UserName/i), 'John Doe');
        await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123');
        await user.type(screen.getByLabelText('Confirm Password'), 'Password123');

        await user.selectOptions(screen.getByTestId('college-select'), 'c1');

        await user.click(screen.getByRole('button', { name: /Create Account/i }));

        expect(authSlice.registerUser).toHaveBeenCalledWith({
            username: 'John Doe',
            email: 'john@example.com',
            password: 'Password123',
            college: 'c1',
            adminCode: '',
            role: 'student',
        });
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('handles registration error', async () => {
        const user = userEvent.setup();
        const mockUnwrap = () => Promise.reject('Email already exists');
        authSlice.registerUser.mockReturnValue((dispatch) => ({ unwrap: mockUnwrap }));

        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <RegisterPage />
                </MemoryRouter>
            </Provider>
        );

        await user.type(screen.getByLabelText(/UserName/i), 'John Doe');
        await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123');
        await user.type(screen.getByLabelText('Confirm Password'), 'Password123');
        await user.selectOptions(screen.getByTestId('college-select'), 'c1');

        await user.click(screen.getByRole('button', { name: /Create Account/i }));

        expect(toastMock.error).toHaveBeenCalledWith('Email already exists');
    });

    test('switches roles and fields', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <RegisterPage />
                </MemoryRouter>
            </Provider>
        );

        // Switch to Admin
        await user.click(screen.getByRole('tab', { name: /Admin/i }));

        expect(screen.getByLabelText(/Admin Code/i)).toBeInTheDocument();
        expect(screen.queryByTestId('college-select')).not.toBeInTheDocument();

        // Switch back to Student
        await user.click(screen.getByRole('tab', { name: /Student/i }));
        expect(screen.getByText('College', { selector: 'label' })).toBeInTheDocument();
        expect(screen.getByTestId('college-select')).toBeInTheDocument();
    });
});

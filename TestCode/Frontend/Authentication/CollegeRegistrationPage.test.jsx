import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CollegeRegistrationPage } from './CollegeRegistrationPage';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import * as collegeSlice from '../../Store/college.slice';
import userEvent from '@testing-library/user-event';

// Mock thunks
vi.mock('../../Store/college.slice', async () => {
    const actual = await vi.importActual('../../Store/college.slice');
    return {
        ...actual,
        registerCollege: vi.fn(),
        resetCollegeStatus: vi.fn(),
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

describe('CollegeRegistrationPage', () => {
    let store;

    const createTestStore = (initialState) => {
        return configureStore({
            reducer: {
                college: (state = initialState, action) => state,
            },
            preloadedState: {
                college: initialState,
            },
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mock return for thunks
        const mockUnwrap = () => Promise.resolve({});
        collegeSlice.registerCollege.mockReturnValue((dispatch) => ({ unwrap: mockUnwrap }));
        collegeSlice.resetCollegeStatus.mockReturnValue({ type: 'college/resetCollegeStatus' });
    });

    test('renders registration form correctly', () => {
        store = createTestStore({ status: 'idle', error: null });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <CollegeRegistrationPage />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByRole('heading', { name: /Register Your College/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/College Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/College Code/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/POC Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Contact Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Contact Number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Street Address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/State/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Pincode/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Submit Registration/i })).toBeInTheDocument();
    });

    test('handles input changes', async () => {
        const user = userEvent.setup();
        store = createTestStore({ status: 'idle', error: null });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <CollegeRegistrationPage />
                </MemoryRouter>
            </Provider>
        );

        await user.type(screen.getByLabelText(/College Name/i), 'Test College');
        await user.type(screen.getByLabelText(/College Code/i), 'TC');
        await user.type(screen.getByLabelText(/POC Name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/Contact Email/i), 'jane@test.com');

        expect(screen.getByLabelText(/College Name/i)).toHaveValue('Test College');
        expect(screen.getByLabelText(/College Code/i)).toHaveValue('TC');
        expect(screen.getByLabelText(/POC Name/i)).toHaveValue('Jane Doe');
        expect(screen.getByLabelText(/Contact Email/i)).toHaveValue('jane@test.com');
    });

    test('submits form with valid data', async () => {
        const user = userEvent.setup();
        store = createTestStore({ status: 'idle', error: null });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <CollegeRegistrationPage />
                </MemoryRouter>
            </Provider>
        );

        // Fill form
        await user.type(screen.getByLabelText(/College Name/i), 'Test College');
        await user.type(screen.getByLabelText(/College Code/i), 'TC');
        await user.type(screen.getByLabelText(/POC Name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/Contact Email/i), 'jane@test.com');
        await user.type(screen.getByLabelText(/Contact Number/i), '1234567890');
        await user.type(screen.getByLabelText(/Street Address/i), '123 Main St');
        await user.type(screen.getByLabelText(/City/i), 'Test City');
        await user.type(screen.getByLabelText(/State/i), 'Test State');
        await user.type(screen.getByLabelText(/Pincode/i), '123456');

        await user.click(screen.getByRole('button', { name: /Submit Registration/i }));

        await waitFor(() => {
            expect(collegeSlice.registerCollege).toHaveBeenCalledWith({
                name: 'Test College',
                code: 'TC',
                website: '',
                description: '',
                poc: {
                    name: 'Jane Doe',
                    contactEmail: 'jane@test.com',
                    contactNumber: '1234567890',
                },
                address: {
                    localAddress: '123 Main St',
                    city: 'Test City',
                    state: 'Test State',
                    country: 'India',
                    pincode: '123456',
                },
            });
        });

        // Should show success message
        await waitFor(() => {
            expect(toastMock.success).toHaveBeenCalledWith('College registration submitted successfully!');
            expect(screen.getByText(/Registration Submitted!/i)).toBeInTheDocument();
        });
    });

    test('handles registration error', async () => {
        const user = userEvent.setup();
        const mockUnwrap = () => Promise.reject('Registration failed');
        collegeSlice.registerCollege.mockReturnValue((dispatch) => ({ unwrap: mockUnwrap }));

        store = createTestStore({ status: 'idle', error: null });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <CollegeRegistrationPage />
                </MemoryRouter>
            </Provider>
        );

        // Fill minimal required fields
        await user.type(screen.getByLabelText(/College Name/i), 'Test College');
        await user.type(screen.getByLabelText(/College Code/i), 'TC');
        await user.type(screen.getByLabelText(/POC Name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/Contact Email/i), 'jane@test.com');
        await user.type(screen.getByLabelText(/Contact Number/i), '1234567890');
        await user.type(screen.getByLabelText(/Street Address/i), '123 Main St');
        await user.type(screen.getByLabelText(/City/i), 'Test City');
        await user.type(screen.getByLabelText(/State/i), 'Test State');
        await user.type(screen.getByLabelText(/Pincode/i), '123456');

        await user.click(screen.getByRole('button', { name: /Submit Registration/i }));

        expect(toastMock.error).toHaveBeenCalledWith('Registration failed');
        expect(screen.queryByText(/Registration Submitted!/i)).not.toBeInTheDocument();
    });

    test('resets status on unmount', () => {
        store = createTestStore({ status: 'idle', error: null });
        const { unmount } = render(
            <Provider store={store}>
                <MemoryRouter>
                    <CollegeRegistrationPage />
                </MemoryRouter>
            </Provider>
        );

        unmount();
        expect(collegeSlice.resetCollegeStatus).toHaveBeenCalled();
    });
});

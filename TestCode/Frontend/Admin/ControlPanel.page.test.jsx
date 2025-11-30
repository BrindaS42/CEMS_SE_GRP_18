import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ControlPanelPage from './ControlPanel.page';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import * as adminSlice from '../../Store/admin.slice';
import userEvent from '@testing-library/user-event';

// Mock dependencies
vi.mock('../../Components/general/Sidebar', () => ({
    Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('../../Components/Admin/ControlPanel/CollegesTab', () => ({
    CollegesTab: ({ onAcceptCollege, onRejectCollege, onSuspendCollege, onUnsuspendCollege }) => (
        <div data-testid="colleges-tab">
            <button onClick={() => onAcceptCollege('col1')}>Accept</button>
            <button onClick={() => onRejectCollege('col1')}>Reject</button>
            <button onClick={() => onSuspendCollege('col1')}>Suspend</button>
            <button onClick={() => onUnsuspendCollege('col1')}>Unsuspend</button>
        </div>
    ),
}));

vi.mock('../../Components/Admin/ControlPanel/EventsTab', () => ({
    EventsTab: ({ onSuspendEvent, onUnsuspendEvent }) => (
        <div data-testid="events-tab">
            <button onClick={() => onSuspendEvent('evt1')}>Suspend</button>
            <button onClick={() => onUnsuspendEvent('evt1')}>Unsuspend</button>
        </div>
    ),
}));

vi.mock('../../Components/Admin/ControlPanel/UsersTab', () => ({
    UsersTab: ({ onSuspendUser, onUnsuspendUser }) => (
        <div data-testid="users-tab">
            <button onClick={() => onSuspendUser('usr1')}>Suspend</button>
            <button onClick={() => onUnsuspendUser('usr1')}>Unsuspend</button>
        </div>
    ),
}));

vi.mock('../../Components/Admin/ControlPanel/AdsTab', () => ({
    AdsTab: ({ onSuspendAd, onUnsuspendAd }) => (
        <div data-testid="ads-tab">
            <button onClick={() => onSuspendAd('ad1')}>Suspend</button>
            <button onClick={() => onUnsuspendAd('ad1')}>Unsuspend</button>
        </div>
    ),
}));

vi.mock('../../Components/ui/segmented-control', () => ({
    SegmentedControl: ({ options, value, onChange }) => (
        <div data-testid="segmented-control">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    data-active={value === opt.value}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    ),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
    },
}));

vi.mock('../../Store/admin.slice', async () => {
    const actual = await vi.importActual('../../Store/admin.slice');
    return {
        ...actual,
        fetchAllCollegesForAdmin: vi.fn(),
        approveCollege: vi.fn(),
        rejectCollege: vi.fn(),
        suspendCollege: vi.fn(),
        unsuspendCollege: vi.fn(),
        fetchAllEventsForAdmin: vi.fn(),
        fetchAllUsersForAdmin: vi.fn(),
        fetchAllAdsForAdmin: vi.fn(),
        toggleEntitySuspension: vi.fn(),
    };
});

describe('ControlPanelPage', () => {
    let store;
    const mockOnNavigate = vi.fn();
    const mockOnToggleSidebar = vi.fn();

    const createTestStore = (initialState) => {
        return configureStore({
            reducer: {
                admin: (state = initialState.admin, action) => state,
            },
            preloadedState: initialState,
        });
    };

    const defaultState = {
        admin: {
            colleges: [],
            events: [],
            users: [],
            ads: [],
            status: 'idle',
            error: null,
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        const mockUnwrap = () => Promise.resolve({});
        const mockThunk = { unwrap: mockUnwrap };

        adminSlice.fetchAllCollegesForAdmin.mockReturnValue({ type: 'test' });
        adminSlice.fetchAllEventsForAdmin.mockReturnValue({ type: 'test' });
        adminSlice.fetchAllUsersForAdmin.mockReturnValue({ type: 'test' });
        adminSlice.fetchAllAdsForAdmin.mockReturnValue({ type: 'test' });

        adminSlice.approveCollege.mockReturnValue((dispatch) => mockThunk);
        adminSlice.rejectCollege.mockReturnValue((dispatch) => mockThunk);
        adminSlice.suspendCollege.mockReturnValue((dispatch) => mockThunk);
        adminSlice.unsuspendCollege.mockReturnValue((dispatch) => mockThunk);
        adminSlice.toggleEntitySuspension.mockReturnValue((dispatch) => mockThunk);
    });

    test('renders control panel and fetches colleges', () => {
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <ControlPanelPage
                    isSidebarCollapsed={false}
                    onToggleSidebar={mockOnToggleSidebar}
                    onNavigate={mockOnNavigate}
                    activePage="admin"
                    role="admin"
                />
            </Provider>
        );

        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('colleges-tab')).toBeInTheDocument();
        expect(adminSlice.fetchAllCollegesForAdmin).toHaveBeenCalled();
    });

    test('switches tabs and fetches data', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <ControlPanelPage
                    isSidebarCollapsed={false}
                    onToggleSidebar={mockOnToggleSidebar}
                    onNavigate={mockOnNavigate}
                    activePage="admin"
                    role="admin"
                />
            </Provider>
        );

        // Switch to Events
        await user.click(screen.getByText('Events'));
        expect(screen.getByTestId('events-tab')).toBeInTheDocument();
        expect(adminSlice.fetchAllEventsForAdmin).toHaveBeenCalled();

        // Switch to Users
        await user.click(screen.getByText('Users'));
        expect(screen.getByTestId('users-tab')).toBeInTheDocument();
        expect(adminSlice.fetchAllUsersForAdmin).toHaveBeenCalled();

        // Switch to Ads
        await user.click(screen.getByText('Ads'));
        expect(screen.getByTestId('ads-tab')).toBeInTheDocument();
        expect(adminSlice.fetchAllAdsForAdmin).toHaveBeenCalled();
    });

    test('handles college actions', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <ControlPanelPage
                    isSidebarCollapsed={false}
                    onToggleSidebar={mockOnToggleSidebar}
                    onNavigate={mockOnNavigate}
                    activePage="admin"
                    role="admin"
                />
            </Provider>
        );

        await user.click(screen.getByText('Accept'));
        expect(adminSlice.approveCollege).toHaveBeenCalledWith('col1');

        await user.click(screen.getByText('Reject'));
        expect(adminSlice.rejectCollege).toHaveBeenCalledWith('col1');

        await user.click(screen.getByText('Suspend'));
        expect(adminSlice.suspendCollege).toHaveBeenCalledWith('col1');

        await user.click(screen.getByText('Unsuspend'));
        expect(adminSlice.unsuspendCollege).toHaveBeenCalledWith('col1');
    });

    test('handles event actions', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <ControlPanelPage
                    isSidebarCollapsed={false}
                    onToggleSidebar={mockOnToggleSidebar}
                    onNavigate={mockOnNavigate}
                    activePage="admin"
                    role="admin"
                />
            </Provider>
        );

        await user.click(screen.getByText('Events'));

        await user.click(screen.getByText('Suspend'));
        expect(adminSlice.toggleEntitySuspension).toHaveBeenCalledWith({
            modelType: 'event',
            id: 'evt1',
            targetStatus: 'suspended',
        });

        await user.click(screen.getByText('Unsuspend'));
        expect(adminSlice.toggleEntitySuspension).toHaveBeenCalledWith({
            modelType: 'event',
            id: 'evt1',
            targetStatus: 'active',
        });
    });

    test('handles user actions', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <ControlPanelPage
                    isSidebarCollapsed={false}
                    onToggleSidebar={mockOnToggleSidebar}
                    onNavigate={mockOnNavigate}
                    activePage="admin"
                    role="admin"
                />
            </Provider>
        );

        await user.click(screen.getByText('Users'));

        await user.click(screen.getByText('Suspend'));
        expect(adminSlice.toggleEntitySuspension).toHaveBeenCalledWith({
            modelType: 'user',
            id: 'usr1',
            targetStatus: 'suspended',
        });

        await user.click(screen.getByText('Unsuspend'));
        expect(adminSlice.toggleEntitySuspension).toHaveBeenCalledWith({
            modelType: 'user',
            id: 'usr1',
            targetStatus: 'active',
        });
    });

    test('handles ad actions', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <ControlPanelPage
                    isSidebarCollapsed={false}
                    onToggleSidebar={mockOnToggleSidebar}
                    onNavigate={mockOnNavigate}
                    activePage="admin"
                    role="admin"
                />
            </Provider>
        );

        await user.click(screen.getByText('Ads'));

        await user.click(screen.getByText('Suspend'));
        expect(adminSlice.toggleEntitySuspension).toHaveBeenCalledWith({
            modelType: 'ad',
            id: 'ad1',
            targetStatus: 'suspended',
        });

        await user.click(screen.getByText('Unsuspend'));
        expect(adminSlice.toggleEntitySuspension).toHaveBeenCalledWith({
            modelType: 'ad',
            id: 'ad1',
            targetStatus: 'active',
        });
    });
});

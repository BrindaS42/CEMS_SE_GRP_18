import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminPanel from './AdminPanel.page';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import * as eventSlice from '../../Store/event.slice';

// Mock dependencies
vi.mock('../../Components/general/Sidebar', () => ({
    Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('../../Components/Organizers/Admin/TeamsAdminTab', () => ({
    TeamsAdminTab: () => <div data-testid="teams-admin-tab">Teams Admin Tab</div>,
}));

vi.mock('../../Components/Organizers/Admin/CreateTeamModal', () => ({
    CreateTeamModal: ({ open, onClose }) => (
        open ? <div data-testid="create-team-modal"><button onClick={onClose}>Close</button></div> : null
    ),
}));

vi.mock('../../Components/Organizers/Admin/EventsAdminTab', () => ({
    EventsAdminTab: () => <div data-testid="events-admin-tab">Events Admin Tab</div>,
}));

vi.mock('../../Components/Organizers/Admin/RegistrationsAdminTab', () => ({
    RegistrationsAdminTab: () => <div data-testid="registrations-admin-tab">Registrations Admin Tab</div>,
}));

vi.mock('../../Components/Organizers/Admin/AnnouncementsAdminTab', () => ({
    AnnouncementsAdminTab: () => <div data-testid="announcements-admin-tab">Announcements Admin Tab</div>,
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

// Mock Redux
vi.mock('../../Store/event.slice', async () => {
    const actual = await vi.importActual('../../Store/event.slice');
    return {
        ...actual,
        fetchDashboardEvents: vi.fn(),
    };
});

describe('AdminPanel', () => {
    let store;
    const mockOnNavigate = vi.fn();
    const mockOnToggleSidebar = vi.fn();
    const mockOnClearHighlight = vi.fn();

    const createTestStore = (initialState) => {
        return configureStore({
            reducer: {
                auth: (state = initialState.auth, action) => state,
                event: (state = initialState.event, action) => state,
            },
            preloadedState: initialState,
        });
    };

    const defaultState = {
        auth: { isAuthenticated: true },
        event: {},
    };

    beforeEach(() => {
        vi.clearAllMocks();
        eventSlice.fetchDashboardEvents.mockReturnValue({ type: 'test' });
    });

    test('renders admin panel correctly', () => {
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <AdminPanel
                    onNavigate={mockOnNavigate}
                    isSidebarCollapsed={false}
                    onToggleSidebar={mockOnToggleSidebar}
                    onClearHighlight={mockOnClearHighlight}
                />
            </Provider>
        );

        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('segmented-control')).toBeInTheDocument();
        // Default tab is teams
        expect(screen.getByTestId('teams-admin-tab')).toBeInTheDocument();
    });

    test('fetches dashboard events on mount if authenticated', () => {
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <AdminPanel
                    onNavigate={mockOnNavigate}
                    isSidebarCollapsed={false}
                    onToggleSidebar={mockOnToggleSidebar}
                    onClearHighlight={mockOnClearHighlight}
                />
            </Provider>
        );

        expect(eventSlice.fetchDashboardEvents).toHaveBeenCalled();
    });

    test('switches tabs correctly', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <AdminPanel
                    onNavigate={mockOnNavigate}
                    isSidebarCollapsed={false}
                    onToggleSidebar={mockOnToggleSidebar}
                    onClearHighlight={mockOnClearHighlight}
                />
            </Provider>
        );

        await user.click(screen.getByText('Events'));
        expect(screen.getByTestId('events-admin-tab')).toBeInTheDocument();

        await user.click(screen.getByText('Registrations'));
        expect(screen.getByTestId('registrations-admin-tab')).toBeInTheDocument();

        await user.click(screen.getByText('Announcements'));
        expect(screen.getByTestId('announcements-admin-tab')).toBeInTheDocument();
    });

    test('opens create team modal via prop', () => {
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <AdminPanel
                    onNavigate={mockOnNavigate}
                    isSidebarCollapsed={false}
                    onToggleSidebar={mockOnToggleSidebar}
                    onClearHighlight={mockOnClearHighlight}
                    openCreateTeamModal={true}
                />
            </Provider>
        );

        expect(screen.getByTestId('create-team-modal')).toBeInTheDocument();
    });

    test('switches to events tab when highlightEventId is provided', () => {
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <AdminPanel
                    onNavigate={mockOnNavigate}
                    isSidebarCollapsed={false}
                    onToggleSidebar={mockOnToggleSidebar}
                    onClearHighlight={mockOnClearHighlight}
                    highlightEventId={123}
                />
            </Provider>
        );

        expect(screen.getByTestId('events-admin-tab')).toBeInTheDocument();
    });

    test('clears highlight when switching tabs', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <AdminPanel
                    onNavigate={mockOnNavigate}
                    isSidebarCollapsed={false}
                    onToggleSidebar={mockOnToggleSidebar}
                    onClearHighlight={mockOnClearHighlight}
                />
            </Provider>
        );

        // Switch to Registrations (which is not teams or events)
        await user.click(screen.getByText('Registrations'));
        expect(mockOnClearHighlight).toHaveBeenCalled();
    });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OrganizerDashboard from './Dashboard.page';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock dependencies
vi.mock('../../Components/general/Sidebar', () => ({
    Sidebar: ({ onNavigate }) => (
        <div data-testid="sidebar">
            <button onClick={() => onNavigate('dashboard')}>Dashboard</button>
        </div>
    ),
}));

vi.mock('../../Components/Organizers/EventsTab', () => ({
    EventsTab: ({ onViewEvent }) => (
        <div data-testid="events-tab">
            Events Content
            <button onClick={() => onViewEvent('event1')}>View Event</button>
        </div>
    ),
}));

vi.mock('../../Components/Organizers/AnalyticsTab', () => ({
    AnalyticsTab: () => <div data-testid="analytics-tab">Analytics Content</div>,
}));

vi.mock('../../Components/Organizers/TeamsTab', () => ({
    TeamsTab: ({ onNavigate }) => (
        <div data-testid="teams-tab">
            Teams Content
            <button onClick={() => onNavigate('team-details')}>View Team</button>
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

describe('OrganizerDashboard', () => {
    const mockOnNavigate = vi.fn();
    const mockOnToggleSidebar = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders dashboard correctly', () => {
        render(
            <OrganizerDashboard
                onNavigate={mockOnNavigate}
                isSidebarCollapsed={false}
                onToggleSidebar={mockOnToggleSidebar}
            />
        );

        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('segmented-control')).toBeInTheDocument();
        expect(screen.getByText('Create Event')).toBeInTheDocument();
        expect(screen.getByText('Create Team')).toBeInTheDocument();
        // Default tab is events
        expect(screen.getByTestId('events-tab')).toBeInTheDocument();
    });

    test('switches tabs correctly', async () => {
        const user = userEvent.setup();
        render(
            <OrganizerDashboard
                onNavigate={mockOnNavigate}
                isSidebarCollapsed={false}
                onToggleSidebar={mockOnToggleSidebar}
            />
        );

        // Switch to Analytics
        await user.click(screen.getByText('Analytics'));
        expect(screen.getByTestId('analytics-tab')).toBeInTheDocument();
        expect(screen.queryByTestId('events-tab')).not.toBeInTheDocument();

        // Switch to Teams
        await user.click(screen.getByText('Teams'));
        expect(screen.getByTestId('teams-tab')).toBeInTheDocument();
        expect(screen.queryByTestId('analytics-tab')).not.toBeInTheDocument();
    });

    test('handles create event action', async () => {
        const user = userEvent.setup();
        render(
            <OrganizerDashboard
                onNavigate={mockOnNavigate}
                isSidebarCollapsed={false}
                onToggleSidebar={mockOnToggleSidebar}
            />
        );

        await user.click(screen.getByText('Create Event'));
        expect(mockOnNavigate).toHaveBeenCalledWith('admin', { openCreateEventModal: true });
    });

    test('handles create team action', async () => {
        const user = userEvent.setup();
        render(
            <OrganizerDashboard
                onNavigate={mockOnNavigate}
                isSidebarCollapsed={false}
                onToggleSidebar={mockOnToggleSidebar}
            />
        );

        await user.click(screen.getByText('Create Team'));
        expect(mockOnNavigate).toHaveBeenCalledWith('admin', { openCreateTeamModal: true });
    });

    test('handles view event action from EventsTab', async () => {
        const user = userEvent.setup();
        render(
            <OrganizerDashboard
                onNavigate={mockOnNavigate}
                isSidebarCollapsed={false}
                onToggleSidebar={mockOnToggleSidebar}
            />
        );

        // Click button inside mock EventsTab
        await user.click(screen.getByText('View Event'));
        expect(mockOnNavigate).toHaveBeenCalledWith('admin', { highlightEventId: 'event1' });
    });

    test('passes onNavigate to TeamsTab', async () => {
        const user = userEvent.setup();
        render(
            <OrganizerDashboard
                onNavigate={mockOnNavigate}
                isSidebarCollapsed={false}
                onToggleSidebar={mockOnToggleSidebar}
            />
        );

        // Switch to Teams
        await user.click(screen.getByText('Teams'));

        // Click button inside mock TeamsTab
        await user.click(screen.getByText('View Team'));
        expect(mockOnNavigate).toHaveBeenCalledWith('team-details');
    });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StudentAdminPanel from './AdminPanel.page';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock dependencies
vi.mock('../../Components/general/Sidebar', () => ({
    Sidebar: ({ onNavigate, onToggleCollapse }) => (
        <div data-testid="sidebar">
            <button onClick={() => onNavigate('dashboard')}>Dashboard</button>
            <button onClick={onToggleCollapse}>Toggle Sidebar</button>
        </div>
    ),
}));

vi.mock('../../Components/Students/Admin/TeamsTab', () => ({
    TeamsTab: ({ openCreateModal, onOpenCreateModal, onCloseCreateModal }) => (
        <div data-testid="teams-tab">
            Teams Content
            {openCreateModal && <div data-testid="create-modal">Create Modal</div>}
            <button onClick={onOpenCreateModal}>Open Create</button>
            <button onClick={onCloseCreateModal}>Close Create</button>
        </div>
    ),
}));

describe('StudentAdminPanel', () => {
    const mockOnNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders admin panel correctly', () => {
        render(<StudentAdminPanel onNavigate={mockOnNavigate} />);

        expect(screen.getByText('Admin Panel')).toBeInTheDocument();
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('teams-tab')).toBeInTheDocument();
    });

    test('handles navigation', async () => {
        const user = userEvent.setup();
        render(<StudentAdminPanel onNavigate={mockOnNavigate} />);

        // Click dashboard in sidebar
        await user.click(screen.getByText('Dashboard'));
        expect(mockOnNavigate).toHaveBeenCalledWith('dashboard');
    });

    test('toggles sidebar', async () => {
        const user = userEvent.setup();
        render(<StudentAdminPanel onNavigate={mockOnNavigate} />);

        // Click toggle sidebar
        await user.click(screen.getByText('Toggle Sidebar'));
    });

    test('handles create team modal state', async () => {
        const user = userEvent.setup();
        render(<StudentAdminPanel onNavigate={mockOnNavigate} />);

        // Open modal
        await user.click(screen.getByText('Open Create'));
        expect(screen.getByTestId('create-modal')).toBeInTheDocument();

        // Close modal
        await user.click(screen.getByText('Close Create'));
        expect(screen.queryByTestId('create-modal')).not.toBeInTheDocument();
    });
});

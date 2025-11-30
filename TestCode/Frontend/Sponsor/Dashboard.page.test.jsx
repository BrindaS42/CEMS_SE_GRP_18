import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SponsorDashboard from './Dashboard.page';
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

vi.mock('../../Components/Sponsors/ViewsTab', () => ({
    ViewsTab: () => <div data-testid="views-tab">Views Content</div>,
}));

vi.mock('../../Components/Sponsors/AdsTab', () => ({
    AdsTab: ({ onNavigateToCreateAd }) => (
        <div data-testid="ads-tab">
            Ads Content
            <button onClick={onNavigateToCreateAd}>Create Ad</button>
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

describe('SponsorDashboard', () => {
    const mockOnNavigate = vi.fn();
    const mockOnToggleSidebar = vi.fn();
    const mockOnUpdateAd = vi.fn();
    const mockAds = [];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders dashboard correctly', () => {
        render(
            <SponsorDashboard
                onNavigate={mockOnNavigate}
                isSidebarCollapsed={false}
                onToggleSidebar={mockOnToggleSidebar}
                ads={mockAds}
                onUpdateAd={mockOnUpdateAd}
            />
        );

        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('segmented-control')).toBeInTheDocument();
        // Default tab is views
        expect(screen.getByTestId('views-tab')).toBeInTheDocument();
    });

    test('switches tabs correctly', async () => {
        const user = userEvent.setup();
        render(
            <SponsorDashboard
                onNavigate={mockOnNavigate}
                isSidebarCollapsed={false}
                onToggleSidebar={mockOnToggleSidebar}
                ads={mockAds}
                onUpdateAd={mockOnUpdateAd}
            />
        );

        // Switch to Ads
        await user.click(screen.getByText('Ads'));
        expect(screen.getByTestId('ads-tab')).toBeInTheDocument();
        expect(screen.queryByTestId('views-tab')).not.toBeInTheDocument();
    });

    test('handles navigation to create ad', async () => {
        const user = userEvent.setup();
        render(
            <SponsorDashboard
                onNavigate={mockOnNavigate}
                isSidebarCollapsed={false}
                onToggleSidebar={mockOnToggleSidebar}
                ads={mockAds}
                onUpdateAd={mockOnUpdateAd}
            />
        );

        // Switch to Ads tab first
        await user.click(screen.getByText('Ads'));

        // Click Create Ad
        await user.click(screen.getByText('Create Ad'));
        expect(mockOnNavigate).toHaveBeenCalledWith('admin', { openCreateAdModal: true });
    });
});

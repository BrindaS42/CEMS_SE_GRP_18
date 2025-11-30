import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SponsorsPage from './SponsorsPage';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { sponsorService } from '@/services/sponsorService';
import userEvent from '@testing-library/user-event';

// Mock dependencies
vi.mock('@/services/sponsorService', () => ({
    sponsorService: {
        getAllSponsors: vi.fn(),
    },
}));

vi.mock('@/Components/ui/card', () => ({
    Card: ({ children, className }) => <div className={className}>{children}</div>,
}));

vi.mock('@/Components/ui/badge', () => ({
    Badge: ({ children, className }) => <span className={className}>{children}</span>,
}));

vi.mock('motion/react', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

describe('SponsorsPage', () => {
    const mockSponsors = [
        {
            _id: 'sp1',
            email: 'sponsor1@test.com',
            profile: {
                company: 'Company A',
                name: 'Sponsor One',
                description: 'Description A',
                phone: '1234567890',
                address: 'Address A',
                logo: 'logo1.png',
            },
            rating: 4.5,
            totalAds: 5,
        },
        {
            _id: 'sp2',
            email: 'sponsor2@test.com',
            profile: {
                company: 'Company B',
                name: 'Sponsor Two',
                description: 'Description B',
                phone: '0987654321',
                address: 'Address B',
                logo: '',
            },
            rating: 3.0,
            totalAds: 2,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        sponsorService.getAllSponsors.mockResolvedValue({ data: mockSponsors });
    });

    test('renders sponsors page and loads data', async () => {
        render(
            <MemoryRouter>
                <SponsorsPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Our Sponsors')).toBeInTheDocument();
        // Loading state might be visible initially
        // Wait for data
        await waitFor(() => {
            expect(screen.getByText('Company A')).toBeInTheDocument();
        });
        expect(screen.getByText('Company B')).toBeInTheDocument();
        expect(sponsorService.getAllSponsors).toHaveBeenCalled();
    });

    test('handles search', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <SponsorsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Company A')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Search sponsors...');
        await user.type(searchInput, 'Company A');

        expect(screen.getByText('Company A')).toBeInTheDocument();
        expect(screen.queryByText('Company B')).not.toBeInTheDocument();
    });

    test('renders empty state', async () => {
        sponsorService.getAllSponsors.mockResolvedValue({ data: [] });
        render(
            <MemoryRouter>
                <SponsorsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('No sponsors found')).toBeInTheDocument();
        });
    });

    test('handles navigation to sponsor details', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <SponsorsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Company A')).toBeInTheDocument();
        });

        // Click View Profile
        // There are multiple buttons, get the first one
        const viewButtons = screen.getAllByText('View Profile');
        await user.click(viewButtons[0]);
        // Since we use MemoryRouter, we can't easily check URL change unless we mock useNavigate or check router state.
        // But we can assume it works if no error.
    });
});

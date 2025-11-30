import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SponsorDetailsPage } from './SponsorDetailsPage';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import * as sponsorSlice from '@/Store/sponsor.slice';

// Mock dependencies
vi.mock('@/Store/sponsor.slice', async () => {
    const actual = await vi.importActual('@/Store/sponsor.slice');
    return {
        ...actual,
        fetchSponsorById: vi.fn(),
        fetchSponsorAds: vi.fn(),
        clearSelectedSponsor: vi.fn(),
    };
});

vi.mock('@/Components/ui/card', () => ({
    Card: ({ children, className }) => <div className={className}>{children}</div>,
    CardHeader: ({ children }) => <div>{children}</div>,
    CardTitle: ({ children }) => <h3>{children}</h3>,
    CardDescription: ({ children }) => <p>{children}</p>,
    CardContent: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/Components/ui/badge', () => ({
    Badge: ({ children, className }) => <span className={className}>{children}</span>,
}));

vi.mock('@/Components/ui/skeleton', () => ({
    Skeleton: ({ className }) => <div className={className} data-testid="skeleton" />,
}));

vi.mock('motion/react', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

describe('SponsorDetailsPage', () => {
    let store;
    const mockSponsor = {
        _id: 'sp1',
        name: 'Sponsor One',
        email: 'sponsor1@test.com',
        profile: {
            name: 'Sponsor One',
            contactNo: '1234567890',
        },
        sponsorDetails: {
            firmLogo: 'logo.png',
            banner: 'banner.png',
            firmDescription: 'Description',
            poc: {
                name: 'POC Name',
                role: 'Manager',
                email: 'poc@test.com',
                contactNo: '9876543210',
            },
            locations: [
                { title: 'HQ', address: 'Address 1', description: 'Headquarters', mapLink: 'http://map.com' }
            ],
            links: ['http://website.com'],
        },
    };

    const mockAds = [
        {
            _id: 'ad1',
            title: 'Ad 1',
            description: 'Ad Description',
            images: ['ad.png'],
            views: 10,
            likes: 5,
            status: 'Published',
        },
    ];

    const createTestStore = (initialState) => {
        return configureStore({
            reducer: {
                sponsor: (state = initialState.sponsor, action) => state,
            },
            preloadedState: initialState,
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
        const mockUnwrap = () => Promise.resolve({});
        const mockThunk = { unwrap: mockUnwrap };

        sponsorSlice.fetchSponsorById.mockReturnValue({ type: 'test' });
        sponsorSlice.fetchSponsorAds.mockReturnValue({ type: 'test' });
        sponsorSlice.clearSelectedSponsor.mockReturnValue({ type: 'test' });
    });

    test('renders loading state', () => {
        store = createTestStore({
            sponsor: { selectedSponsor: null, ads: [], loading: true, error: null },
        });
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/sponsors/sp1']}>
                    <Routes>
                        <Route path="/sponsors/:id" element={<SponsorDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
    });

    test('renders not found state', () => {
        store = createTestStore({
            sponsor: { selectedSponsor: null, ads: [], loading: false, error: null },
        });
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/sponsors/sp1']}>
                    <Routes>
                        <Route path="/sponsors/:id" element={<SponsorDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Sponsor Not Found')).toBeInTheDocument();
        expect(screen.getByText('Back to Sponsors')).toBeInTheDocument();
    });

    test('renders sponsor details and ads', () => {
        store = createTestStore({
            sponsor: { selectedSponsor: mockSponsor, ads: mockAds, loading: false, error: null },
        });
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/sponsors/sp1']}>
                    <Routes>
                        <Route path="/sponsors/:id" element={<SponsorDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Sponsor One')).toBeInTheDocument();
        expect(screen.getByText('Verified Sponsor')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
        expect(screen.getByText('Ad 1')).toBeInTheDocument();
        expect(screen.getByText('HQ')).toBeInTheDocument();
        expect(screen.getByText('POC Name')).toBeInTheDocument();

        expect(sponsorSlice.fetchSponsorById).toHaveBeenCalledWith('sp1');
        expect(sponsorSlice.fetchSponsorAds).toHaveBeenCalledWith('sp1');
    });

    test('clears sponsor on unmount', () => {
        store = createTestStore({
            sponsor: { selectedSponsor: mockSponsor, ads: [], loading: false, error: null },
        });
        const { unmount } = render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/sponsors/sp1']}>
                    <Routes>
                        <Route path="/sponsors/:id" element={<SponsorDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        unmount();
        expect(sponsorSlice.clearSelectedSponsor).toHaveBeenCalled();
    });
});

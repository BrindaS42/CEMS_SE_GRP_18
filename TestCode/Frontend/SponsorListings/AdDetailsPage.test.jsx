import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdDetailsPage from './AdDetailsPage';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import * as sponsorSlice from '@/Store/sponsor.slice';
import userEvent from '@testing-library/user-event';

// Mock dependencies
vi.mock('@/Store/sponsor.slice', async () => {
    const actual = await vi.importActual('@/Store/sponsor.slice');
    return {
        ...actual,
        fetchAdById: vi.fn(),
        clearSelectedAd: vi.fn(),
        incrementAdView: vi.fn(),
        toggleAdLike: vi.fn(),
    };
});

vi.mock('@/Components/ui/card', () => ({
    Card: ({ children, className }) => <div className={className}>{children}</div>,
}));

vi.mock('@/Components/ui/badge', () => ({
    Badge: ({ children, className }) => <span className={className}>{children}</span>,
}));

vi.mock('@/Components/ui/separator', () => ({
    Separator: ({ className }) => <hr className={className} />,
}));

vi.mock('motion/react', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('AdDetailsPage', () => {
    let store;
    const mockAd = {
        _id: 'ad1',
        title: 'Ad Title',
        description: 'Ad Description',
        status: 'Published',
        views: 10,
        likes: 5,
        images: ['img1.jpg', 'img2.jpg'],
        poster: 'poster.jpg',
        videos: ['video1.mp4'],
        address: 'Stall 1',
        actualAddress: 'Business Address',
        contact: '1234567890',
        sponsorId: {
            _id: 'sp1',
            email: 'sponsor@test.com',
            profile: { name: 'Sponsor Name' },
            sponsorDetails: { firmLogo: 'logo.png' },
        },
    };

    const createTestStore = (initialState) => {
        return configureStore({
            reducer: {
                auth: (state = initialState.auth, action) => state,
                sponsor: (state = initialState.sponsor, action) => state,
            },
            preloadedState: initialState,
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
        const mockUnwrap = () => Promise.resolve({});
        const mockThunk = { unwrap: mockUnwrap };
        const mockPromise = Promise.resolve({});

        sponsorSlice.fetchAdById.mockReturnValue(() => mockPromise);
        sponsorSlice.clearSelectedAd.mockReturnValue({ type: 'test' });
        sponsorSlice.incrementAdView.mockReturnValue({ type: 'test' });
        sponsorSlice.toggleAdLike.mockReturnValue({ type: 'test' });
    });

    test('renders loading state', () => {
        store = createTestStore({
            auth: { isAuthenticated: true },
            sponsor: { selectedAd: null, loading: true },
        });
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/ads/ad1']}>
                    <Routes>
                        <Route path="/ads/:id" element={<AdDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        // Check for loading skeleton structure (e.g. gray divs)
        // Or just check that main content is not there
        expect(screen.queryByText('Ad Title')).not.toBeInTheDocument();
    });

    test('renders not found state', () => {
        store = createTestStore({
            auth: { isAuthenticated: true },
            sponsor: { selectedAd: null, loading: false },
        });
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/ads/ad1']}>
                    <Routes>
                        <Route path="/ads/:id" element={<AdDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Advertisement not found')).toBeInTheDocument();
    });

    test('renders ad details and handles interactions', async () => {
        const user = userEvent.setup();
        store = createTestStore({
            auth: { isAuthenticated: true },
            sponsor: { selectedAd: mockAd, loading: false },
        });
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/ads/ad1']}>
                    <Routes>
                        <Route path="/ads/:id" element={<AdDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Ad Title')).toBeInTheDocument();
        expect(screen.getByText('Ad Description')).toBeInTheDocument();
        expect(screen.getByText('Sponsor Name')).toBeInTheDocument();

        // Check image gallery interaction
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThan(0);

        // Check like button
        const likeButton = screen.getByText('5').closest('button');
        await user.click(likeButton);
        expect(sponsorSlice.toggleAdLike).toHaveBeenCalledWith({ adId: 'ad1', liked: true });
    });

    test('handles like when not authenticated', async () => {
        const user = userEvent.setup();
        store = createTestStore({
            auth: { isAuthenticated: false },
            sponsor: { selectedAd: mockAd, loading: false },
        });
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/ads/ad1']}>
                    <Routes>
                        <Route path="/ads/:id" element={<AdDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        const likeButton = screen.getByText('5').closest('button');
        await user.click(likeButton);
        expect(sponsorSlice.toggleAdLike).not.toHaveBeenCalled();
        // Should show toast error
    });
});

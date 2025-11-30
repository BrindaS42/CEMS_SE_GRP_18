import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminPanel from './AdminPanel.page';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import * as sponsorAdsSlice from '../../Store/sponsorAds.slice';
import userEvent from '@testing-library/user-event';

// Mock dependencies
vi.mock('../../Components/general/Sidebar', () => ({
    Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('../../Components/Sponsors/Admin/DraftedAdsTab', () => ({
    DraftedAdsTab: ({ onUpdateAd, onDeleteAd, onPublishAd }) => (
        <div data-testid="drafted-ads-tab">
            <button onClick={() => onUpdateAd({ _id: 'ad1' }, 'save')}>Update Ad</button>
            <button onClick={() => onDeleteAd('ad1')}>Delete Ad</button>
            <button onClick={() => onPublishAd('ad1')}>Publish Ad</button>
        </div>
    ),
}));

vi.mock('../../Components/Sponsors/Admin/PublishedAdsTab', () => ({
    PublishedAdsTab: ({ onUpdateAd }) => (
        <div data-testid="published-ads-tab">
            <button onClick={() => onUpdateAd({ _id: 'ad2' }, 'save')}>Update Published Ad</button>
        </div>
    ),
}));

vi.mock('../../Components/Sponsors/Admin/CreateAdModal', () => ({
    CreateAdModal: ({ open, onClose, onSave }) => (
        open ? (
            <div data-testid="create-ad-modal">
                <button onClick={() => onSave({ title: 'New Ad' }, 'save')}>Save New</button>
                <button onClick={() => onSave({ title: 'New Ad' }, 'publish')}>Publish New</button>
                <button onClick={onClose}>Close</button>
            </div>
        ) : null
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

vi.mock('../../Store/sponsorAds.slice', async () => {
    const actual = await vi.importActual('../../Store/sponsorAds.slice');
    return {
        ...actual,
        fetchSponsorAds: vi.fn(),
        createSponsorAd: vi.fn(),
        updateSponsorAd: vi.fn(),
        deleteSponsorAd: vi.fn(),
        publishSponsorAd: vi.fn(),
    };
});

describe('Sponsor AdminPanel', () => {
    let store;
    const mockOnNavigate = vi.fn();
    const mockOnToggleSidebar = vi.fn();
    const mockUser = { id: 'sponsor1', role: 'sponsor' };

    const createTestStore = (initialState) => {
        return configureStore({
            reducer: {
                auth: (state = initialState.auth, action) => state,
                sponsorAds: (state = initialState.sponsorAds, action) => state,
            },
            preloadedState: initialState,
        });
    };

    const defaultState = {
        auth: { user: mockUser },
        sponsorAds: { ads: [], status: 'idle' },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        const mockUnwrap = () => Promise.resolve({});
        const mockThunk = { unwrap: mockUnwrap };
        const mockPromise = Promise.resolve({ payload: { _id: 'newAd1' } });

        sponsorAdsSlice.fetchSponsorAds.mockReturnValue({ type: 'test' });
        sponsorAdsSlice.createSponsorAd.mockReturnValue(() => mockPromise);
        sponsorAdsSlice.updateSponsorAd.mockReturnValue(() => mockPromise);
        sponsorAdsSlice.deleteSponsorAd.mockReturnValue({ type: 'test' });
        sponsorAdsSlice.publishSponsorAd.mockReturnValue({ type: 'test' });
    });

    test('renders admin panel and fetches ads', () => {
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <AdminPanel
                    onNavigate={mockOnNavigate}
                    isSidebarCollapsed={false}
                    onToggleSidebar={mockOnToggleSidebar}
                />
            </Provider>
        );

        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('drafted-ads-tab')).toBeInTheDocument();
        expect(sponsorAdsSlice.fetchSponsorAds).toHaveBeenCalled();
    });

    test('switches tabs', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <AdminPanel
                    onNavigate={mockOnNavigate}
                    isSidebarCollapsed={false}
                    onToggleSidebar={mockOnToggleSidebar}
                />
            </Provider>
        );

        await user.click(screen.getByText('Published'));
        expect(screen.getByTestId('published-ads-tab')).toBeInTheDocument();
    });

    test('opens create ad modal', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <AdminPanel
                    onNavigate={mockOnNavigate}
                    isSidebarCollapsed={false}
                    onToggleSidebar={mockOnToggleSidebar}
                />
            </Provider>
        );

        await user.click(screen.getByText('Create Ad'));
        expect(screen.getByTestId('create-ad-modal')).toBeInTheDocument();
    });

    test('handles ad actions in drafted tab', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <AdminPanel
                    onNavigate={mockOnNavigate}
                    isSidebarCollapsed={false}
                    onToggleSidebar={mockOnToggleSidebar}
                />
            </Provider>
        );

        await user.click(screen.getByText('Update Ad'));
        expect(sponsorAdsSlice.updateSponsorAd).toHaveBeenCalledWith(expect.objectContaining({
            id: 'ad1',
            adData: { _id: 'ad1' }
        }));

        await user.click(screen.getByText('Delete Ad'));
        expect(sponsorAdsSlice.deleteSponsorAd).toHaveBeenCalledWith('ad1');

        await user.click(screen.getByText('Publish Ad'));
        expect(sponsorAdsSlice.publishSponsorAd).toHaveBeenCalledWith('ad1');
    });

    test('handles create new ad', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <AdminPanel
                    onNavigate={mockOnNavigate}
                    isSidebarCollapsed={false}
                    onToggleSidebar={mockOnToggleSidebar}
                    openCreateAdModal={true}
                />
            </Provider>
        );

        await user.click(screen.getByText('Save New'));
        expect(sponsorAdsSlice.createSponsorAd).toHaveBeenCalledWith(expect.objectContaining({
            title: 'New Ad',
            sponsorId: 'sponsor1'
        }));
    });

    test('handles publish new ad', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <AdminPanel
                    onNavigate={mockOnNavigate}
                    isSidebarCollapsed={false}
                    onToggleSidebar={mockOnToggleSidebar}
                    openCreateAdModal={true}
                />
            </Provider>
        );

        await user.click(screen.getByText('Publish New'));
        // It should create first, then publish
        expect(sponsorAdsSlice.createSponsorAd).toHaveBeenCalled();
        // Since we mocked createSponsorAd to return a promise resolving to payload with _id,
        // publishSponsorAd should be called in the .then() block.
        // We need to wait for promise resolution.
        await waitFor(() => {
            expect(sponsorAdsSlice.publishSponsorAd).toHaveBeenCalledWith('newAd1');
        });
    });
});

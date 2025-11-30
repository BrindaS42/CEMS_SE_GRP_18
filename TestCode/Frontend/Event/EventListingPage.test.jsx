import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventListingPage } from './EventListingPage';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import * as studentEventsSlice from '@/Store/studentEvents.slice';
import userEvent from '@testing-library/user-event';

// Mock dependencies
vi.mock('@/Components/ChatBot', () => ({
    ChatBot: () => <div data-testid="chatbot">ChatBot</div>,
}));

vi.mock('@/Store/studentEvents.slice', async () => {
    const actual = await vi.importActual('@/Store/studentEvents.slice');
    return {
        ...actual,
        fetchPublicEvents: vi.fn(),
    };
});

// Mock UI components
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

describe('EventListingPage', () => {
    let store;
    const mockEvents = [
        {
            _id: 'event1',
            title: 'Event 1',
            description: 'Description 1',
            categoryTags: ['Tech'],
            venue: { address: 'Venue 1' },
            timeline: [{ date: new Date().toISOString() }],
            registrationCount: 10,
            gallery: ['image1.jpg'],
        },
        {
            _id: 'event2',
            title: 'Event 2',
            description: 'Description 2',
            categoryTags: ['Cultural'],
            venue: { address: 'Venue 2' },
            timeline: [{ date: new Date().toISOString() }],
            registrationCount: 60, // Trending
            gallery: [],
        },
    ];

    const createTestStore = (initialState) => {
        return configureStore({
            reducer: {
                auth: (state = initialState.auth, action) => state,
                studentEvents: (state = initialState.studentEvents, action) => state,
            },
            preloadedState: initialState,
        });
    };

    const defaultState = {
        auth: { user: { role: 'student' }, isAuthenticated: true },
        studentEvents: { events: mockEvents, pagination: { pages: 2 }, loading: false },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        studentEventsSlice.fetchPublicEvents.mockReturnValue({ type: 'test' });
    });

    test('renders event listing correctly', () => {
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <EventListingPage />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Discover Events')).toBeInTheDocument();
        expect(screen.getByText('Event 1')).toBeInTheDocument();
        expect(screen.getByText('Event 2')).toBeInTheDocument();
        expect(screen.getByText('Tech')).toBeInTheDocument();
        expect(screen.getByText('Trending')).toBeInTheDocument();
        expect(screen.getByTestId('chatbot')).toBeInTheDocument();
    });

    test('renders loading state', () => {
        store = createTestStore({
            ...defaultState,
            studentEvents: { events: [], pagination: {}, loading: true },
        });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <EventListingPage />
                </MemoryRouter>
            </Provider>
        );

        // Skeleton elements usually don't have text, but we can check for structure or absence of events
        expect(screen.queryByText('Event 1')).not.toBeInTheDocument();
        // We can check if skeletons are rendered by class or just assume if no events are shown and loading is true
    });

    test('renders empty state', () => {
        store = createTestStore({
            ...defaultState,
            studentEvents: { events: [], pagination: {}, loading: false },
        });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <EventListingPage />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('No events found')).toBeInTheDocument();
    });

    test('handles search', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <EventListingPage />
                </MemoryRouter>
            </Provider>
        );

        const searchInput = screen.getByPlaceholderText('Search events...');
        await user.type(searchInput, 'Tech');

        // Debounce might be an issue if implemented, but here it seems direct or effect-based
        // The effect runs on searchQuery change.
        await waitFor(() => {
            expect(studentEventsSlice.fetchPublicEvents).toHaveBeenCalledWith(expect.objectContaining({
                search: 'Tech',
            }));
        });
    });

    test('handles tag filtering', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <EventListingPage />
                </MemoryRouter>
            </Provider>
        );

        const techTag = screen.getByRole('button', { name: 'Technical' });
        await user.click(techTag);

        await waitFor(() => {
            expect(studentEventsSlice.fetchPublicEvents).toHaveBeenCalledWith(expect.objectContaining({
                categoryTags: 'Technical',
            }));
        });

        // Toggle off
        await user.click(techTag);
        await waitFor(() => {
            expect(studentEventsSlice.fetchPublicEvents).toHaveBeenCalledWith(expect.not.objectContaining({
                categoryTags: 'Technical',
            }));
        });
    });

    test('handles pagination', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <EventListingPage />
                </MemoryRouter>
            </Provider>
        );

        const nextButton = screen.getByRole('button', { name: 'Next' });
        await user.click(nextButton);

        await waitFor(() => {
            expect(studentEventsSlice.fetchPublicEvents).toHaveBeenCalledWith(expect.objectContaining({
                page: 2,
            }));
        });

        const prevButton = screen.getByRole('button', { name: 'Previous' });
        await user.click(prevButton);

        await waitFor(() => {
            expect(studentEventsSlice.fetchPublicEvents).toHaveBeenCalledWith(expect.objectContaining({
                page: 1,
            }));
        });
    });

    test('renders correctly for non-student', () => {
        store = createTestStore({
            ...defaultState,
            auth: { user: { role: 'organizer' }, isAuthenticated: true },
        });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <EventListingPage />
                </MemoryRouter>
            </Provider>
        );

        // Check for specific styling or elements if needed
        // For example, the gradient class changes.
        // But functionally it's similar.
        expect(screen.getByText('Discover Events')).toBeInTheDocument();
    });
});

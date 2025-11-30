import { render, screen, waitFor } from '@testing-library/react';
import { HomePage } from './HomePage';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { eventService } from '../services/eventService';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock eventService
vi.mock('../services/eventService', () => ({
    eventService: {
        getTrendingEvents: vi.fn(),
    },
}));

// Mock ChatBot
vi.mock('@/Components/ChatBot', () => ({
    ChatBot: () => <div data-testid="chatbot">ChatBot</div>,
}));

// Mock motion/react
vi.mock('motion/react', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        p: ({ children, ...props }) => <p {...props}>{children}</p>,
    },
}));

// Mock lucide-react icons to avoid issues
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        // We can just use the actual icons or mock them if they cause issues.
        // For now, let's keep them as is or mock if needed.
        // If we need to mock:
        // Calendar: () => <svg data-testid="icon-calendar" />,
    };
});

describe('HomePage', () => {
    let store;

    const createTestStore = (initialState) => {
        return configureStore({
            reducer: {
                auth: (state = initialState, action) => state,
            },
            preloadedState: {
                auth: initialState,
            },
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders correctly and calls getTrendingEvents', async () => {
        eventService.getTrendingEvents.mockResolvedValue({ data: [] });
        store = createTestStore({ isAuthenticated: false, user: null });

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            </Provider>
        );

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/College Events/i);
        expect(screen.getByText(/Made Easy!/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(eventService.getTrendingEvents).toHaveBeenCalled();
        });
    });

    test('renders unauthenticated view correctly', async () => {
        eventService.getTrendingEvents.mockResolvedValue({ data: [] });
        store = createTestStore({ isAuthenticated: false, user: null });

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            </Provider>
        );

        expect(screen.getByText(/Get Started Free/i)).toBeInTheDocument();
        expect(screen.getByText(/Browse Events/i)).toBeInTheDocument();
        expect(screen.queryByText(/Go to Dashboard/i)).not.toBeInTheDocument();
        expect(screen.queryByTestId('chatbot')).not.toBeInTheDocument();
    });

    test('renders authenticated view correctly', async () => {
        eventService.getTrendingEvents.mockResolvedValue({ data: [] });
        store = createTestStore({ isAuthenticated: true, user: { role: 'student' } });

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            </Provider>
        );

        const exploreButtons = screen.getAllByText(/Explore Events/i);
        expect(exploreButtons.length).toBeGreaterThan(0);
        expect(screen.getByText(/Go to Dashboard/i)).toBeInTheDocument();
        expect(screen.getByTestId('chatbot')).toBeInTheDocument();
    });

    test('handles error in getTrendingEvents gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        eventService.getTrendingEvents.mockRejectedValue(new Error('Network error'));
        store = createTestStore({ isAuthenticated: false, user: null });

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            </Provider>
        );

        await waitFor(() => {
            expect(eventService.getTrendingEvents).toHaveBeenCalled();
        });

        expect(consoleSpy).toHaveBeenCalledWith('Failed to load trending events:', expect.any(Error));
        consoleSpy.mockRestore();
    });
});

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { SearchResultsPage } from './SearchResultsPage';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Mock motion/react
vi.mock('motion/react', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

// We need to mock useNavigate to test navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock sonner
vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
    },
}));

describe('SearchResultsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders loading state', async () => {
        axios.get.mockReturnValue(new Promise(() => { })); // Never resolves

        render(
            <MemoryRouter initialEntries={['/search?q=test']}>
                <SearchResultsPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Search Results')).toBeInTheDocument();
        // Check for loading skeletons or absence of no results
        expect(screen.queryByText('No Results Found')).not.toBeInTheDocument();
    });

    test('renders no results', async () => {
        axios.get.mockResolvedValue({ data: { events: [], users: [], sponsors: [], organizers: [] } });

        render(
            <MemoryRouter initialEntries={['/search?q=test']}>
                <SearchResultsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('No Results Found')).toBeInTheDocument();
        });
    });

    test('renders results correctly', async () => {
        const mockData = {
            events: [{ _id: 'e1', title: 'Test Event', description: 'Desc' }],
            users: [{ _id: 'u1', email: 'user@test.com', role: 'student', profile: { name: 'Test User' } }],
            sponsors: [],
            organizers: [],
        };
        axios.get.mockResolvedValue({ data: mockData });

        render(
            <MemoryRouter initialEntries={['/search?q=test']}>
                <SearchResultsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Event')).toBeInTheDocument();
            expect(screen.getByText('Test User')).toBeInTheDocument();
        });
    });



    describe('SearchResultsPage Navigation', () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        test('navigates to event details on click', async () => {
            const mockData = {
                events: [{ _id: 'e1', title: 'Test Event', description: 'Desc' }],
                users: [],
                sponsors: [],
                organizers: [],
            };
            axios.get.mockResolvedValue({ data: mockData });

            render(
                <MemoryRouter initialEntries={['/search?q=test']}>
                    <SearchResultsPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText('Test Event')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Test Event'));
            expect(mockNavigate).toHaveBeenCalledWith('/events/e1');
        });

        test('handles search error', async () => {
            axios.get.mockRejectedValue(new Error('Network Error'));
            // We need to mock toast to check if error is shown
            const { toast } = await import('sonner');

            render(
                <MemoryRouter initialEntries={['/search?q=test']}>
                    <SearchResultsPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to perform search');
            });
        });
    });
});

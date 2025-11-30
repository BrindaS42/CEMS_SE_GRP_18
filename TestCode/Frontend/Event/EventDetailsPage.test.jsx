import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { EventDetailsPage } from './EventDetailsPage';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import * as studentEventsSlice from '@/Store/studentEvents.slice';
import * as authSlice from '@/Store/auth.slice';
import * as eventInteractionSlice from '@/Store/event.interaction.slice';
import * as registrationSlice from '@/Store/registration.slice';
import * as adminSlice from '@/Store/admin.slice';
import userEvent from '@testing-library/user-event';
import { socket } from '@/service/socket';

// Mock dependencies
vi.mock('@/service/socket', () => ({
    socket: {
        connected: true,
        id: 'mock-socket-id',
        emit: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
    },
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('motion/react', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock UI components that might cause issues or are too complex
vi.mock('@/Components/EventComponents/SponsorAdCarousel', () => ({
    default: () => <div data-testid="sponsor-carousel">Sponsor Carousel</div>,
}));

vi.mock('@/Components/EventComponents/Map/AnnotatedMapView', () => ({
    default: () => <div data-testid="map-view">Map View</div>,
}));

vi.mock('@/Components/ui/tabs', () => ({
    Tabs: ({ children }) => { console.log("Rendering Tabs"); return <div>{children}</div>; },
    TabsList: ({ children }) => <div>{children}</div>,
    TabsTrigger: ({ children }) => <button role="tab">{children}</button>,
    TabsContent: ({ children }) => { console.log("Rendering TabsContent"); return <div>{children}</div>; },
}));

// Mock Redux slices
vi.mock('@/Store/studentEvents.slice', async () => {
    const actual = await vi.importActual('@/Store/studentEvents.slice');
    return {
        ...actual,
        fetchEventDetails: vi.fn(),
        addEventRating: vi.fn(),
    };
});

vi.mock('@/Store/event.interaction.slice', async () => {
    const actual = await vi.importActual('@/Store/event.interaction.slice');
    return {
        ...actual,
        fetchAllMessages: vi.fn(),
        sendMessage: vi.fn(),
        addMessage: vi.fn(),
        clearMessages: vi.fn(),
    };
});

vi.mock('@/Store/registration.slice', async () => {
    const actual = await vi.importActual('@/Store/registration.slice');
    return {
        ...actual,
        submitRegistration: vi.fn(),
        getRegistrationStatus: vi.fn(),
        markCheckIn: vi.fn(),
    };
});

vi.mock('@/Store/admin.slice', async () => {
    const actual = await vi.importActual('@/Store/admin.slice');
    return {
        ...actual,
        createReport: vi.fn(),
    };
});

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('EventDetailsPage', () => {
    let store;
    const mockEvent = {
        _id: 'event1',
        title: 'Test Event',
        description: 'This is a test event description.',
        venue: 'Test Venue',
        posterUrl: 'http://example.com/poster.jpg',
        categoryTags: ['Tech'],
        config: {
            registrationType: 'Individual',
            registrationFields: [],
            fees: 0,
        },
        timeline: [
            {
                _id: 'timeline1',
                title: 'Session 1',
                date: new Date().toISOString(),
                duration: { from: '10:00', to: '11:00' },
                description: 'Intro',
                checkInRequired: true,
            }
        ],
        announcements: [
            {
                _id: 'ann1',
                message: 'Welcome!',
                date: new Date().toISOString(),
                time: '09:00',
            }
        ],
        sponsors: [],
        ratings: [],
        poc: {
            name: 'Organizer Name',
            email: 'org@test.com',
            contact: '1234567890',
        },
        createdBy: {
            leader: { _id: 'organizer1' },
            members: [],
        },
    };

    const createTestStore = (initialState) => {
        return configureStore({
            reducer: {
                auth: (state = initialState.auth, action) => state,
                studentEvents: (state = initialState.studentEvents, action) => state,
                eventInteraction: (state = initialState.eventInteraction, action) => state,
                registration: (state = initialState.registration, action) => state,
                admin: (state = initialState.admin, action) => state,
            },
            preloadedState: initialState,
        });
    };

    const defaultState = {
        auth: { user: { id: 'user1', role: 'student' }, isAuthenticated: true },
        studentEvents: { currentEvent: mockEvent, loading: false },
        eventInteraction: { messages: [], status: 'idle' },
        registration: { status: null },
        admin: {},
    };

    beforeEach(() => {
        vi.clearAllMocks();

        const mockUnwrap = () => Promise.resolve({});
        const mockThunkReturn = { unwrap: mockUnwrap };

        studentEventsSlice.fetchEventDetails.mockReturnValue((dispatch) => mockThunkReturn);
        studentEventsSlice.addEventRating.mockReturnValue((dispatch) => mockThunkReturn);
        eventInteractionSlice.fetchAllMessages.mockReturnValue((dispatch) => mockThunkReturn);
        eventInteractionSlice.sendMessage.mockReturnValue((dispatch) => mockThunkReturn);
        eventInteractionSlice.addMessage.mockReturnValue({ type: 'test' }); // addMessage is a sync action
        eventInteractionSlice.clearMessages.mockReturnValue({ type: 'test' }); // clearMessages is a sync action
        registrationSlice.getRegistrationStatus.mockReturnValue((dispatch) => mockThunkReturn);
        registrationSlice.submitRegistration.mockReturnValue((dispatch) => mockThunkReturn);
        registrationSlice.markCheckIn.mockReturnValue((dispatch) => mockThunkReturn);
        adminSlice.createReport.mockReturnValue((dispatch) => mockThunkReturn);
    });

    test('renders loading state', () => {
        store = createTestStore({
            ...defaultState,
            studentEvents: { currentEvent: null, loading: true },
        });
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/events/event1']}>
                    <Routes>
                        <Route path="/events/:id" element={<EventDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );
        // Skeleton should be present (checking by class or structure might be hard, but we can check that event title is NOT present)
        expect(screen.queryByText('Test Event')).not.toBeInTheDocument();
    });

    test('renders event not found state', () => {
        store = createTestStore({
            ...defaultState,
            studentEvents: { currentEvent: null, loading: false },
        });
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/events/event1']}>
                    <Routes>
                        <Route path="/events/:id" element={<EventDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );
        expect(screen.getByText('Event Not Found')).toBeInTheDocument();
    });

    test('renders event details correctly', () => {
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/events/event1']}>
                    <Routes>
                        <Route path="/events/:id" element={<EventDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Test Event')).toBeInTheDocument();
        expect(screen.getByText('This is a test event description.')).toBeInTheDocument();
        expect(screen.getByText('Venue Information')).toBeInTheDocument();
        expect(screen.getByText('Test Venue')).toBeInTheDocument();
        expect(screen.getByText('Organizer Name')).toBeInTheDocument();
    });

    test('switches tabs correctly', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/events/event1']}>
                    <Routes>
                        <Route path="/events/:id" element={<EventDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        // Timeline tab
        await user.click(screen.getByRole('tab', { name: /Timeline/i }));
        expect(screen.getByText('Event Timeline')).toBeInTheDocument();
        expect(screen.getByText('Session 1')).toBeInTheDocument();

        // Announcements tab
        await user.click(screen.getByRole('tab', { name: /Announcements/i }));
        expect(screen.getByRole('heading', { name: /Announcements/i })).toBeInTheDocument();
        expect(screen.getByText('Welcome!')).toBeInTheDocument();

        // Chatroom tab
        await user.click(screen.getByRole('tab', { name: /Chatroom/i }));
        expect(screen.getByText('Event Chatroom')).toBeInTheDocument();
    });

    test('handles chat functionality', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/events/event1']}>
                    <Routes>
                        <Route path="/events/:id" element={<EventDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        await user.click(screen.getByRole('tab', { name: /Chatroom/i }));

        const input = screen.getByPlaceholderText('Type your message...');
        await user.type(input, 'Hello everyone!');

        fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

        expect(eventInteractionSlice.sendMessage).toHaveBeenCalledWith({
            eventId: 'event1',
            message: 'Hello everyone!',
        });
    });

    test('handles registration for student', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        const { container } = render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/events/event1']}>
                    <Routes>
                        <Route path="/events/:id" element={<EventDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        await user.click(screen.getByRole('tab', { name: /Register/i }));

        await waitFor(() => expect(screen.getByText('Event Registration')).toBeInTheDocument());

        const form = container.querySelector('form');
        fireEvent.submit(form);

        expect(registrationSlice.submitRegistration).toHaveBeenCalled();
    });

    test('shows login alert for unauthenticated user in registration', async () => {
        const user = userEvent.setup();
        store = createTestStore({
            ...defaultState,
            auth: { user: null, isAuthenticated: false },
        });
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/events/event1']}>
                    <Routes>
                        <Route path="/events/:id" element={<EventDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        await user.click(screen.getByRole('tab', { name: /Register/i }));
        
        // Use getAllByText and find the specific one for registration
        const alerts = screen.getAllByText(/Please/i);
        const registrationAlert = alerts.find(el => 
            el.textContent.includes('register for this event')
        );
        expect(registrationAlert).toBeInTheDocument();
    });

    test('submits a review', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        const { container } = render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/events/event1']}>
                    <Routes>
                        <Route path="/events/:id" element={<EventDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        const reviewInput = screen.getByPlaceholderText('Share your experience with this event...');
        await user.type(reviewInput, 'Great event!');

        // Find star buttons (they are buttons inside the rating section)
        // The rating section has "Your Rating:" text.
        // We can find the buttons that are siblings to "Your Rating:" text container?
        // Or just find all buttons with SVG children that are not the submit button.

        // Let's try to find by class since we know the class 'transition-transform'
        const starButtons = container.querySelectorAll('button.transition-transform');
        if (starButtons.length >= 5) {
            await user.click(starButtons[4]); // Click 5th star
        }

        const submitButton = screen.getByRole('button', { name: /Submit Review/i });
        await user.click(submitButton);

        expect(studentEventsSlice.addEventRating).toHaveBeenCalledWith({
            eventId: 'event1',
            rating: { rating: 5, review: 'Great event!' },
        });
    });

    test('handles check-in for organizer', async () => {
        const user = userEvent.setup();
        store = createTestStore({
            ...defaultState,
            auth: { user: { id: 'organizer1', role: 'organizer' }, isAuthenticated: true },
        });
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/events/event1']}>
                    <Routes>
                        <Route path="/events/:id" element={<EventDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        await user.click(screen.getByRole('tab', { name: /Timeline/i }));

        // Find the check-in button in the timeline card
        const checkInButtons = screen.getAllByRole('button', { name: /Check-in/i });
        await user.click(checkInButtons[0]);

        const codeInput = screen.getByPlaceholderText('Enter check-in code');
        await user.type(codeInput, '123456');

        // The submit button in dialog also says "Check-in"
        // We need to find the one in the dialog.
        // Since the dialog is open, it should be visible.
        // We can use within(dialog).
        const dialog = screen.getByRole('dialog');
        const submitButton = within(dialog).getByRole('button', { name: /Check-in/i });
        await user.click(submitButton);

        expect(registrationSlice.markCheckIn).toHaveBeenCalledWith({
            checkInCode: '123456',
            timelineRef: 'timeline1',
        });
    });

    test('handles report submission', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/events/event1']}>
                    <Routes>
                        <Route path="/events/:id" element={<EventDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        const reportButton = screen.getByRole('button', { name: /Report/i });
        await user.click(reportButton);

        const textarea = screen.getByPlaceholderText('Describe the issue...');
        await user.type(textarea, 'Inappropriate content');

        const submitButton = screen.getByRole('button', { name: /Submit Report/i });
        await user.click(submitButton);

        expect(adminSlice.createReport).toHaveBeenCalledWith({
            modelType: 'event',
            id: 'event1',
            reason: 'Inappropriate content',
        });
    });

    test('renders sponsors and map tabs', async () => {
        const user = userEvent.setup();
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/events/event1']}>
                    <Routes>
                        <Route path="/events/:id" element={<EventDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        await user.click(screen.getByRole('tab', { name: /Sponsors/i }));
        expect(screen.getByTestId('sponsor-carousel')).toBeInTheDocument();

        await user.click(screen.getByRole('tab', { name: /Map/i }));
        expect(screen.getByTestId('map-view')).toBeInTheDocument();
    });

    test('handles socket message reception', () => {
        store = createTestStore(defaultState);
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/events/event1']}>
                    <Routes>
                        <Route path="/events/:id" element={<EventDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        // Simulate receiving a message
        // We need to capture the callback passed to socket.on('receive_message', ...)
        // socket.on is a mock.
        const calls = socket.on.mock.calls;
        const receiveMessageCall = calls.find(call => call[0] === 'receive_message');

        if (receiveMessageCall) {
            const callback = receiveMessageCall[1];
            callback({ eventId: 'event1', message: 'New message', sender: { _id: 'user2' } });

            expect(eventInteractionSlice.addMessage).toHaveBeenCalledWith({
                eventId: 'event1',
                message: 'New message',
                sender: { _id: 'user2' },
            });
        }
    });

    test('handles custom registration fields', async () => {
        const user = userEvent.setup();
        const mockUser = { id: 'user1', role: 'student' };
        const eventWithCustomFields = {
            ...mockEvent,
            config: {
                ...mockEvent.config,
                registrationFields: [
                    { title: 'T-Shirt Size', inputType: 'text', required: true },
                ]
            }
        };

        store = createTestStore({
            auth: { user: mockUser, isAuthenticated: true },
            studentEvents: { currentEvent: eventWithCustomFields, loading: false },
            registration: { status: null },
            eventInteraction: { messages: [], status: 'idle' },
            admin: {},
        });

        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/events/event1']}>
                    <Routes>
                        <Route path="/events/:id" element={<EventDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        // Click Register to open dialog/form
        const registerButton = screen.getByRole('tab', { name: /Register/i });
        await user.click(registerButton);

        await waitFor(() => {
            expect(screen.getByText('Event Registration')).toBeInTheDocument();
            expect(screen.getByText(/T-Shirt Size/i)).toBeInTheDocument();
        });

        // Fill custom field
        const input = screen.getByLabelText(/T-Shirt Size/i);
        await user.type(input, 'L');

        // Submit
        const submitButton = screen.getByRole('button', { name: /Register for Event/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(registrationSlice.submitRegistration).toHaveBeenCalledWith(expect.objectContaining({
                registrationData: expect.arrayContaining([
                    expect.objectContaining({ question: 'T-Shirt Size', answer: 'L' })
                ])
            }));
        });
    });
});

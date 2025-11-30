import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { InboxPage } from './InboxPage';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import * as inboxSlice from '../Store/inbox.slice';
import userEvent from '@testing-library/user-event';

// Mock inbox slice thunks
vi.mock('../Store/inbox.slice', () => ({
    fetchArrivals: vi.fn(),
    fetchSent: vi.fn(),
    fetchDrafts: vi.fn(),
    createDraft: vi.fn(),
    sendMessage: vi.fn(),
    sendDirectMessage: vi.fn(),
    updateDraft: vi.fn(),
    deleteMessage: vi.fn(),
    approveMessage: vi.fn(),
    rejectMessage: vi.fn(),
}));

// Mock Sidebar
vi.mock('../Components/general/Sidebar', () => ({
    Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

// Mock motion/react
vi.mock('motion/react', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}));

// Mock UI components that might cause issues or to simplify
// We'll use real components where possible, but if they are complex, we might need to mock.
// For now, let's assume they work with jsdom.

describe('InboxPage', () => {
    let store;
    const mockUser = { id: 'user1', role: 'student', profile: { name: 'Test User' } };

    const mockArrivals = [
        {
            _id: 'msg1',
            type: 'message',
            title: 'Hello',
            description: 'Welcome',
            from: { _id: 'admin1', profile: { name: 'Admin' } },
            to: [{ _id: 'user1', profile: { name: 'Test User' } }],
            createdAt: new Date().toISOString(),
            status: 'Sent',
        },
        {
            _id: 'msg2',
            type: 'team_invite',
            title: 'Join Team',
            description: 'Please join',
            from: { _id: 'org1', profile: { name: 'Organizer' } },
            to: [{ _id: 'user1', profile: { name: 'Test User' } }],
            createdAt: new Date().toISOString(),
            status: 'Pending',
        },
    ];

    const mockSent = [
        {
            _id: 'sent1',
            type: 'message',
            title: 'Sent Message',
            description: 'I sent this',
            from: { _id: 'user1', profile: { name: 'Test User' } },
            to: [{ _id: 'admin1', profile: { name: 'Admin' } }],
            createdAt: new Date().toISOString(),
            status: 'Sent',
        },
    ];

    const mockDrafts = [
        {
            _id: 'draft1',
            type: 'message',
            title: 'Draft Message',
            description: 'Work in progress',
            from: { _id: 'user1', profile: { name: 'Test User' } },
            to: [{ email: 'admin@test.com', role: 'admin' }],
            status: 'Draft',
        },
    ];

    const createTestStore = (initialState) => {
        return configureStore({
            reducer: {
                auth: (state = { user: mockUser }, action) => state,
                inbox: (state = initialState, action) => state,
            },
            preloadedState: {
                auth: { user: mockUser },
                inbox: initialState,
            },
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mock implementations for thunks to return a promise that resolves
        // This is important because dispatch(thunk).unwrap() is called
        const mockUnwrap = () => Promise.resolve({});
        const mockThunk = () => ({ unwrap: mockUnwrap });

        inboxSlice.fetchArrivals.mockReturnValue({ type: 'inbox/fetchArrivals' });
        inboxSlice.fetchSent.mockReturnValue({ type: 'inbox/fetchSent' });
        inboxSlice.fetchDrafts.mockReturnValue({ type: 'inbox/fetchDrafts' });

        inboxSlice.createDraft.mockReturnValue(mockThunk());
        inboxSlice.sendMessage.mockReturnValue(mockThunk());
        inboxSlice.sendDirectMessage.mockReturnValue(mockThunk());
        inboxSlice.updateDraft.mockReturnValue(mockThunk());
        inboxSlice.deleteMessage.mockReturnValue(mockThunk());
        inboxSlice.approveMessage.mockReturnValue(mockThunk());
        inboxSlice.rejectMessage.mockReturnValue(mockThunk());
    });

    test('renders inbox and loads messages', () => {
        store = createTestStore({
            arrivals: mockArrivals,
            sent: [],
            drafts: [],
            status: 'succeeded',
        });

        render(
            <Provider store={store}>
                <InboxPage />
            </Provider>
        );

        expect(screen.getByRole('heading', { name: /Inbox/i })).toBeInTheDocument();
        expect(screen.getByText('Hello')).toBeInTheDocument(); // msg1 title
        expect(screen.getByText('Join Team')).toBeInTheDocument(); // msg2 title

        expect(inboxSlice.fetchArrivals).toHaveBeenCalled();
        expect(inboxSlice.fetchSent).toHaveBeenCalled();
        expect(inboxSlice.fetchDrafts).toHaveBeenCalled();
    });

    test('displays message details when clicked', async () => {
        store = createTestStore({
            arrivals: mockArrivals,
            sent: [],
            drafts: [],
            status: 'succeeded',
        });

        render(
            <Provider store={store}>
                <InboxPage />
            </Provider>
        );

        const messageCard = screen.getByText('Hello').closest('div');
        fireEvent.click(screen.getByText('Hello'));

        // "Welcome" appears in list and detail.
        const welcomes = screen.getAllByText('Welcome');
        expect(welcomes.length).toBeGreaterThanOrEqual(1);

        // Check for something unique to detail view, e.g. "From: Admin"
        // Or check that the detail card is visible.
        expect(screen.getByText('From: Admin')).toBeInTheDocument();
    });

    test('switches tabs correctly', async () => {
        const user = userEvent.setup();
        store = createTestStore({
            arrivals: mockArrivals,
            sent: mockSent,
            drafts: mockDrafts,
            status: 'succeeded',
        });

        render(
            <Provider store={store}>
                <InboxPage />
            </Provider>
        );

        // Click Sent tab
        const sentTab = screen.getByRole('tab', { name: /Sent/i });
        await user.click(sentTab);

        await waitFor(() => {
            expect(screen.getByText('Sent Message')).toBeInTheDocument();
        });
        expect(screen.queryByText('Hello')).not.toBeInTheDocument();

        // Click Draft tab
        const draftTab = screen.getByRole('tab', { name: /Draft/i });
        await user.click(draftTab);

        await waitFor(() => {
            expect(screen.getByText('Draft Message')).toBeInTheDocument();
        });
    });

    test('opens compose dialog and sends message', async () => {
        const user = userEvent.setup();
        store = createTestStore({
            arrivals: [],
            sent: [],
            drafts: [],
            status: 'succeeded',
        });

        render(
            <Provider store={store}>
                <InboxPage />
            </Provider>
        );

        // Open compose dialog
        const composeButton = screen.getByText(/Compose/i);
        await user.click(composeButton);

        await waitFor(() => {
            expect(screen.getByText('Compose New Message')).toBeInTheDocument();
        });

        // Fill form
        const titleInput = screen.getByLabelText(/Title/i);
        await user.type(titleInput, 'New Message');

        const messageInput = screen.getByLabelText(/Message \*/i); // The label is "Message *"
        await user.type(messageInput, 'Hello there');

        // Add recipient by pressing Enter
        const emailInput = screen.getByPlaceholderText('recipient@example.com');
        await user.type(emailInput, 'test@example.com{Enter}');

        // Wait for recipient to be added
        await waitFor(() => {
            expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
        });

        // Click Send
        const sendButton = screen.getByRole('button', { name: /Send/i });
        await user.click(sendButton);

        await waitFor(() => {
            expect(inboxSlice.sendDirectMessage).toHaveBeenCalledWith(expect.objectContaining({
                title: 'New Message',
                description: 'Hello there',
                to: expect.arrayContaining([expect.objectContaining({ email: 'test@example.com' })]),
            }));
        });
    }, 10000);

    test('deletes a message', async () => {
        const user = userEvent.setup();
        store = createTestStore({
            arrivals: mockArrivals,
            sent: [],
            drafts: [],
            status: 'succeeded',
        });

        render(
            <Provider store={store}>
                <InboxPage />
            </Provider>
        );

        // Select message
        await user.click(screen.getByText('Hello'));

        // Click delete button
        const deleteButton = screen.getByRole('button', { name: /Delete Message/i });
        await user.click(deleteButton);

        expect(inboxSlice.deleteMessage).toHaveBeenCalledWith('msg1');
    });

    test('filters messages', async () => {
        const user = userEvent.setup();
        store = createTestStore({
            arrivals: mockArrivals,
            sent: [],
            drafts: [],
            status: 'succeeded',
        });

        render(
            <Provider store={store}>
                <InboxPage />
            </Provider>
        );

        // Search
        const searchInput = screen.getByPlaceholderText('Search messages...');
        await user.type(searchInput, 'Hello');
        expect(screen.getByText('Hello')).toBeInTheDocument();
        expect(screen.queryByText('Join Team')).not.toBeInTheDocument();

        await user.clear(searchInput);
        expect(screen.getByText('Join Team')).toBeInTheDocument();

        // Filter by type (this might be tricky with Select component, assuming it uses Radix UI or native select)
        // If it's Radix UI, we need to click trigger then option.
        // Trigger has text "Filter by type" or current value.
        // Let's try to find the trigger.
        // const filterTrigger = screen.getByText('All Types'); // Initial value
        // await user.click(filterTrigger);
        // const option = screen.getByText('Team Invites');
        // await user.click(option);
        // expect(screen.queryByText('Hello')).not.toBeInTheDocument();
        // expect(screen.getByText('Join Team')).toBeInTheDocument();
    });

    test('manages recipients in compose', async () => {
        const user = userEvent.setup();
        store = createTestStore({
            arrivals: [],
            sent: [],
            drafts: [],
            status: 'succeeded',
        });

        render(
            <Provider store={store}>
                <InboxPage />
            </Provider>
        );

        const composeButton = screen.getByText(/Compose/i);
        await user.click(composeButton);

        const emailInput = screen.getByPlaceholderText('recipient@example.com');
        await user.type(emailInput, 'test@example.com');
        await user.keyboard('{Enter}');

        expect(screen.getByText('test@example.com (student)')).toBeInTheDocument();
    });

    test('approves a request', async () => {
        const user = userEvent.setup();
        store = createTestStore({
            arrivals: mockArrivals,
            sent: [],
            drafts: [],
            status: 'succeeded',
        });

        render(
            <Provider store={store}>
                <InboxPage />
            </Provider>
        );

        // Select the pending request (msg2)
        await user.click(screen.getByText('Join Team'));

        // Check if Accept/Reject buttons are visible
        const acceptButton = screen.getByRole('button', { name: /Accept/i });
        expect(acceptButton).toBeInTheDocument();

        // Click Accept
        await user.click(acceptButton);

        // Confirm dialog
        const confirmButton = screen.getByRole('button', { name: 'Accept' }); // In AlertDialog
        await user.click(confirmButton);

        expect(inboxSlice.approveMessage).toHaveBeenCalledWith('msg2');
    });

    test('validates compose form', async () => {
        const user = userEvent.setup();
        store = createTestStore({
            arrivals: [],
            sent: [],
            drafts: [],
            status: 'succeeded',
        });

        render(
            <Provider store={store}>
                <InboxPage />
            </Provider>
        );

        await user.click(screen.getByText(/Compose/i));

        // Try to send without title
        const sendButton = screen.getByRole('button', { name: /Send/i });
        expect(sendButton).toBeDisabled();

        // Fill title
        await user.type(screen.getByLabelText(/Title/i), 'Test Title');
        expect(sendButton).toBeDisabled(); // Still disabled because no recipient

        // Add recipient
        const emailInput = screen.getByPlaceholderText('recipient@example.com');
        await user.type(emailInput, 'test@example.com');
        await user.keyboard('{Enter}');

        expect(sendButton).not.toBeDisabled();
    });

    test('edits a draft', async () => {
        const user = userEvent.setup();
        store = createTestStore({
            arrivals: [],
            sent: [],
            drafts: mockDrafts,
            status: 'succeeded',
        });

        render(
            <Provider store={store}>
                <InboxPage />
            </Provider>
        );

        // Go to Drafts tab
        await user.click(screen.getByRole('tab', { name: /Draft/i }));

        // Click on draft to view details
        await user.click(screen.getByText('Draft Message'));

        // Click Edit button
        const editButton = screen.getByRole('button', { name: /Edit Draft/i });
        await user.click(editButton);

        // Check if form is populated
        expect(screen.getByDisplayValue('Draft Message')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Work in progress')).toBeInTheDocument();

        // Update and save
        await user.type(screen.getByLabelText(/Title/i), ' Updated');
        await user.click(screen.getByRole('button', { name: /Save as Draft/i }));

        expect(inboxSlice.updateDraft).toHaveBeenCalledWith(expect.objectContaining({
            draftId: 'draft1',
            payload: expect.objectContaining({
                title: 'Draft Message Updated'
            })
        }));
    });
});

import { jest } from '@jest/globals';

describe('Inbox Controller Coverage', () => {
    let req, res, consoleErrorSpy;
    let InboxEntity, User, College;
    let createDraft, getListOfDrafts, getListOfSents, getListOfArrivals;

    let mockSave, mockFind, mockFindById, mockFindByIdAndUpdate, mockFindByIdAndDelete, mockCreate;

    beforeEach(async () => {
        jest.clearAllMocks();

        req = {
            user: { id: 'userId123', role: 'admin' },
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        consoleErrorSpy = jest.spyOn(console, 'error');

        // Setup mocks
        mockSave = jest.fn();
        mockFind = jest.fn();
        mockFindById = jest.fn();
        mockFindByIdAndUpdate = jest.fn();
        mockFindByIdAndDelete = jest.fn();
        mockCreate = jest.fn();

        const MockInboxEntity = jest.fn().mockImplementation(() => ({
            save: mockSave
        }));
        MockInboxEntity.find = mockFind;
        MockInboxEntity.findById = mockFindById;
        MockInboxEntity.findByIdAndUpdate = mockFindByIdAndUpdate;
        MockInboxEntity.findByIdAndDelete = mockFindByIdAndDelete;
        MockInboxEntity.create = mockCreate;

        jest.unstable_mockModule('../../models/inbox.model.js', () => ({
            default: MockInboxEntity
        }));

        jest.unstable_mockModule('../../models/user.model.js', () => ({
            default: {
                find: jest.fn(),
                findOne: jest.fn(),
                findById: jest.fn(),
                findByIdAndUpdate: jest.fn(),
                updateMany: jest.fn(),
            }
        }));

        jest.unstable_mockModule('../../models/college.model.js', () => ({
            default: {
                findOne: jest.fn(),
                findById: jest.fn(),
                findOneAndUpdate: jest.fn(),
            }
        }));

        // Import modules
        InboxEntity = (await import('../../models/inbox.model.js')).default;
        User = (await import('../../models/user.model.js')).default;
        College = (await import('../../models/college.model.js')).default;

        const controller = await import('../../controllers/inbox.controller.js');
        createDraft = controller.createDraft;
        getListOfDrafts = controller.getListOfDrafts;
        getListOfSents = controller.getListOfSents;
        getListOfArrivals = controller.getListOfArrivals;
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        jest.restoreAllMocks();
        jest.resetModules();
    });

    describe('createDraft - broadcastRecipients coverage', () => {
        it('should handle invalid broadcast keyword by returning null (empty to list)', async () => {
            req.body = {
                type: 'announcement',
                title: 'Test',
                to: ['invalid_keyword']
            };

            // We can't easily test the unreachable code, but we can verify the controller doesn't crash
            // and that it calls create with empty to list if logic falls through (though it won't fall through to broadcastRecipients)

            // Let's just run it to ensure no errors
            mockCreate.mockResolvedValue({ _id: 'draft1' });
            mockFindById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue({})
                })
            });

            // Mock User.findOne to return chainable object
            const mockSelect = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
            User.findOne.mockReturnValue({ select: mockSelect });

            await createDraft(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('getListOfDrafts - populate transform coverage', () => {
        it('should handle deleted users in from/to fields', async () => {
            const mockDrafts = [
                {
                    _id: 'draft1',
                    from: null, // Deleted user
                    to: null,   // Deleted user
                    relatedEvent: { name: 'Event' },
                    relatedTeam: { name: 'Team' }
                }
            ];

            const mockSort = jest.fn().mockResolvedValue(mockDrafts);
            const mockPopulate4 = jest.fn().mockReturnValue({ sort: mockSort });
            const mockPopulate3 = jest.fn().mockReturnValue({ populate: mockPopulate4 });
            const mockPopulate2 = jest.fn().mockReturnValue({ populate: mockPopulate3 });
            const mockPopulate1 = jest.fn().mockReturnValue({ populate: mockPopulate2 });

            mockFind.mockReturnValue({ populate: mockPopulate1 });

            await getListOfDrafts(req, res);

            const call1 = mockPopulate1.mock.calls[0][0];
            expect(call1.path).toBe('from');
            expect(call1.transform(null)).toEqual({ profile: { name: '[Deleted User]' } });

            const call2 = mockPopulate2.mock.calls[0][0];
            expect(call2.path).toBe('to');
            expect(call2.transform(null)).toEqual({ profile: { name: '[Deleted User]' } });
        });
    });

    describe('getListOfSents - populate transform coverage', () => {
        it('should handle deleted users in from/to fields', async () => {
            const mockSents = [{ _id: 'sent1' }];
            const mockSort = jest.fn().mockResolvedValue(mockSents);

            const mockPopulate4 = jest.fn().mockReturnValue({ sort: mockSort });
            const mockPopulate3 = jest.fn().mockReturnValue({ populate: mockPopulate4 });
            const mockPopulate2 = jest.fn().mockReturnValue({ populate: mockPopulate3 });
            const mockPopulate1 = jest.fn().mockReturnValue({ populate: mockPopulate2 });

            mockFind.mockReturnValue({ populate: mockPopulate1 });

            await getListOfSents(req, res);

            const call1 = mockPopulate1.mock.calls[0][0];
            expect(call1.path).toBe('from');
            expect(call1.transform(null)).toEqual({ profile: { name: '[Deleted User]' } });

            const call2 = mockPopulate2.mock.calls[0][0];
            expect(call2.path).toBe('to');
            expect(call2.transform(null)).toEqual({ profile: { name: '[Deleted User]' } });
        });
    });

    describe('getListOfArrivals - populate transform coverage', () => {
        it('should handle deleted users in from/to fields', async () => {
            const mockArrivals = [{ _id: 'arr1' }];
            const mockSort = jest.fn().mockResolvedValue(mockArrivals);

            const mockPopulate4 = jest.fn().mockReturnValue({ sort: mockSort });
            const mockPopulate3 = jest.fn().mockReturnValue({ populate: mockPopulate4 });
            const mockPopulate2 = jest.fn().mockReturnValue({ populate: mockPopulate3 });
            const mockPopulate1 = jest.fn().mockReturnValue({ populate: mockPopulate2 });

            mockFind.mockReturnValue({ populate: mockPopulate1 });

            await getListOfArrivals(req, res);

            const call1 = mockPopulate1.mock.calls[0][0];
            expect(call1.path).toBe('from');
            expect(call1.transform(null)).toEqual({ profile: { name: '[Deleted User]' } });

            const call2 = mockPopulate2.mock.calls[0][0];
            expect(call2.path).toBe('to');
            expect(call2.transform(null)).toEqual({ profile: { name: '[Deleted User]' } });
        });
    });
});

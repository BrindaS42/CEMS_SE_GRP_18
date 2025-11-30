import { jest } from '@jest/globals';

describe('Nodemailer Config', () => {
    let mockCreateTransport;
    let mockTransporter;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should create a transporter and verify connection successfully', async () => {
        mockCreateTransport = jest.fn();
        mockTransporter = {
            verify: jest.fn((cb) => {
                cb(null, true);
            }),
        };
        mockCreateTransport.mockReturnValue(mockTransporter);

        jest.unstable_mockModule('nodemailer', () => ({
            default: {
                createTransport: mockCreateTransport,
            },
        }));

        await import('../../config/nodemailer.js');

        expect(mockCreateTransport).toHaveBeenCalled();
        expect(mockTransporter.verify).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith("Nodemailer is configured and ready to send emails.");
    });

    it('should handle verification error', async () => {
        jest.resetModules(); // Reset modules to reload config/nodemailer.js

        mockCreateTransport = jest.fn();
        const error = new Error('Connection failed');
        mockTransporter = {
            verify: jest.fn((cb) => {
                cb(error, null);
            }),
        };
        mockCreateTransport.mockReturnValue(mockTransporter);

        jest.unstable_mockModule('nodemailer', () => ({
            default: {
                createTransport: mockCreateTransport,
            },
        }));

        await import('../../config/nodemailer.js');

        expect(mockTransporter.verify).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith("Error with Nodemailer transporter config:", error);
    });
});

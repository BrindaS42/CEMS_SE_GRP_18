import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true, index: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, 'Please provide a valid email address'],
        },
        passwordHash: { type: String, required: true },
        authProvider: { type: String, enum: ['JWT', 'googleAuth', 'githubAuth'], default: 'JWT' },
        role: {
            type: String,
            enum: ['student', 'organizer', 'admin', 'sponsor', 'user'],
            default: 'user',
            index: true,
        },
        status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
        profile: {
            name: String,
            photoUrl: String,
            contactNo: String,
            address: String,
            organization: String,
            dob: Date,
            areasOfInterest: [String],
            resumeUrl: {
                type: String,
                required: function () {
                    return this.role === 'student';
                },
            },
            graduationYear: {
                type: Number,
                required: function () {
                    return this.role === 'student';
                },
            },
        },
        preferences: {
            darkMode: { type: Boolean, default: false },
            language: { type: String, default: 'en' }
        },
        lastLogin: { type: Date, default: Date.now },
        embeddings: { type: [Number], default: [] }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model('User', userSchema);
export default User;
const mongoose = require('mongoose');
const { Schema } = mongoose;
const { hash } = require('bcrypt');

const passwordHistorySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    changedAt: {
        type: Date,
        default: Date.now
    },
    changedBy: {
        type: String,
        enum: ['user', 'admin', 'reset'],
        default: 'user'
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true
});

// Index for efficient queries
passwordHistorySchema.index({ userId: 1, changedAt: -1 });
passwordHistorySchema.index({ userId: 1, passwordHash: 1 });

// Pre-save middleware to hash password
passwordHistorySchema.pre('save', async function(next) {
    if (this.isModified('passwordHash')) {
        this.passwordHash = await hash(this.passwordHash, 10);
    }
    next();
});

// Static method to check if password was recently used
passwordHistorySchema.statics.checkPasswordHistory = async function(userId, newPassword, limit = 5) {
    const { hash } = require('bcrypt');
    const newPasswordHash = await hash(newPassword, 10);
    
    // Get recent password hashes for this user
    const recentPasswords = await this.find({ userId })
        .sort({ changedAt: -1 })
        .limit(limit)
        .select('passwordHash');
    
    // Check if new password matches any recent password
    const { compare } = require('bcrypt');
    for (const record of recentPasswords) {
        const isMatch = await compare(newPassword, record.passwordHash);
        if (isMatch) {
            return {
                isReused: true,
                lastUsed: record.changedAt,
                message: `Password was used ${limit} passwords ago`
            };
        }
    }
    
    return { isReused: false };
};

// Static method to add password to history
passwordHistorySchema.statics.addPasswordToHistory = async function(userId, password, metadata = {}) {
    const record = new this({
        userId,
        passwordHash: password,
        changedBy: metadata.changedBy || 'user',
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent
    });
    
    await record.save();
    
    // Keep only the last 10 password records per user
    const count = await this.countDocuments({ userId });
    if (count > 10) {
        const oldestRecords = await this.find({ userId })
            .sort({ changedAt: 1 })
            .limit(count - 10);
        
        await this.deleteMany({ _id: { $in: oldestRecords.map(r => r._id) } });
    }
};

// Static method to get password change history
passwordHistorySchema.statics.getPasswordHistory = async function(userId, limit = 10) {
    return await this.find({ userId })
        .sort({ changedAt: -1 })
        .limit(limit)
        .select('-passwordHash')
        .lean();
};

// Static method to clear password history for a user
passwordHistorySchema.statics.clearPasswordHistory = async function(userId) {
    return await this.deleteMany({ userId });
};

const PasswordHistory = mongoose.model('password_history', passwordHistorySchema);

module.exports = PasswordHistory; 
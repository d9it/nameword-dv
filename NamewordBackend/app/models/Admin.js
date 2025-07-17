const mongoose = require('mongoose');
const {Schema} = mongoose;
const { hash, compare } = require('bcrypt');
const PasswordValidator = require('../utils/passwordValidator');

const adminSchema = new Schema({
	name:  {
        type: String,
        required: true
    },
    email:  {
        type: String,
		unique: true,
		required: true,
    },
	password: {
        type: String,
        required: true,
    },
    username: {
        type: String,
    },
    sshKeyName: {
        type: String,
    },
    publicKey: {
        type: String,
    },
    privateKey: {
        type: String,
    },
},{
    timestamps: true ,
    toJSON:{
        transform(doc, ret){
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        }
    }
});

adminSchema.pre('save', async function(next){

    if(this.isModified('password')){
        // Validate password strength for admin accounts (stricter requirements)
        const passwordValidation = PasswordValidator.validatePassword(this.get('password'), {
            minLength: 16, // Longer minimum for admin accounts
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            preventCommonPasswords: true,
            preventSequentialChars: true,
            preventRepeatingChars: true
        });
        
        if (!passwordValidation.isValid) {
            throw new Error(`Admin password validation failed: ${passwordValidation.errors.join(', ')}`);
        }

        const hashedPassword = await hash(this.get('password'), 12); // Increased rounds for security
        this.set('password', hashedPassword);
    }

    next();
});

adminSchema.method('isValidPassword', async function(password){
    const isValid = await compare(password, this.get('password'));
    return isValid;
});

const Admin = mongoose.model('admin', adminSchema);
module.exports = Admin;
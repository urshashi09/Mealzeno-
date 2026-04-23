import user from '../models/user.js';
import jwt from 'jsonwebtoken';
import userPreference from '../models/userPreference.js';


const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

export const register = async (req, res,next) => {
    try {
        const { email, password , name} = req.body || {}

        if (!email || !password || !name) {
            return res.status(400).json({ 
                message: 'Please provide email, password and name' 
            });
        }

        const existingUser = await user.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Email already in use' 
            });
        }

        const newUser = await user.createUser(name, email, password);
        await userPreference.upsert(newUser.id, {})

        const token = generateToken(newUser);
        res.status(201).json({ 
            token, 
            user: { id: newUser.id, email: newUser.email, name: newUser.name } 
        });
    } catch (error) {
        next(error);
    }   

}

export const login = async (req, res,next) => {
    try {
        const { email, password } = req.body || {}

        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Please provide email and password' 
            });
        }

        const existingUser = await user.findByEmail(email);
        if (!existingUser) {
            return res.status(400).json({ 
                message: 'Invalid email or password' 
            });
        }

        const isMatch = await user.verifyPassword(password, existingUser.password_hash);
        if (!isMatch) {
            return res.status(400).json({ 
                message: 'Invalid email or password' 
            });
        }

        const token = generateToken(existingUser);

        res.status(200).json({ 
            token, 
            user: { id: existingUser.id, email: existingUser.email, name: existingUser.name } 
        });
    } catch (error) {
        next(error);
    }       
}


export const getCurrentUser = async (req, res,next) => {
    try {
        const currentUser = await user.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ 
            success: true,
            data: { user: currentUser }
         });
    } catch (error) {
        next(error);
    }

}

export const requestPasswordReset = async (req, res,next) => {
    try {
        const { email } = req.body || {};
        if (!email) {
            return res.status(400).json({ 
                message: 'Please provide an email' 
            });
        }

        const existingUser = await user.findByEmail(email);
        if (!existingUser) {
            return res.status(400).json({ 
                message: 'No user found with that email' 
            });
        }

        // Here you would generate a password reset token and send an email with the reset link. For simplicity, we'll just return a success message.
        res.status(200).json({ 
            message: 'Password reset instructions sent to your email' 
        });
    } catch (error) {
        next(error);
    }   
}

export const resetPassword = async (req, res,next) => {
    try {
        const { token, newPassword } = req.body || {};
        if (!token || !newPassword) {
            return res.status(400).json({ 
                message: 'Please provide a token and new password' 
            });
        }

        // Here you would verify the token and extract the user ID. For simplicity, we'll assume the token is valid and contains the user ID.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        await user.updatePassword(userId, newPassword);
        res.status(200).json({ 
            message: 'Password reset successful' 
        });
    } catch (error) {
        next(error);
    }
}

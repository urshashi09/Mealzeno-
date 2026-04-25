import user from "../models/user.js";
import userPreference from "../models/userPreference.js";


export const getProfile = async (req, res,next) => {
    try {
        const userId = req.user.id;
        const userData = await user.findById(userId);
        const preferences = await userPreference.findByUserId(userId);

        res.status(200).json({ 
            success: true,
            message: 'Profile retrieved successfully',
            data: { user: userData, preferences }
        });
    } catch (error) {
        next(error);
    }   
}

export const updateProfile = async (req, res,next) => {
    try {
        const userId = req.user.id;
        const { name, email } = req.body;

        const updatedUser = await user.update(userId, { name, email });
        res.status(200).json({ 
            message: 'Profile updated successfully',
            user: updatedUser 
        });
    }
    catch (error) {
        next(error);
    }   
}


export const updatePreferences = async (req, res,next) => {
    try {
        const userId = req.user.id;
        const body = req.body;

        // Normalize measurement field — frontend may send either name
        const normalized = {
            ...body,
            measurement_units: body.measurement_units || body.measurement_unit || 'metric'
        };
        delete normalized.measurement_unit;

        const updatedPreferences = await userPreference.upsert(userId, normalized);
        res.status(200).json({ 
            success: true,
            message: 'Preferences updated successfully',
            data: { preferences: updatedPreferences }
        });
    }
    catch (error) {
        next(error);
    }   
}

export const changePassword = async (req, res,next) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;  
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                message: 'Please provide current and new password' 
            });
        }

        const userData = await user.findById(userId);
        const isMatch = await user.verifyPassword(currentPassword, userData.password_hash);
        if (!isMatch) {
            return res.status(400).json({ 
                message: 'Current password is incorrect' 
            });
        }   

        await user.updatePassword(userId, newPassword);
        res.status(200).json({ 
            message: 'Password updated successfully'
        });
    } catch (error) {
        next(error);
    }   
}


export const deleteAccount = async (req, res,next) => {
    try {
        const userId = req.user.id;
        await user.delete(userId);
        await userPreference.delete(userId);
        res.status(200).json({ 
            message: 'Account deleted successfully'
        });
    } catch (error) {
        next(error);
    }   
}
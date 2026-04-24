import jwt from "jsonwebtoken"


const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "")
        if (!token) {
            return res.status(401).json({ message: "no token provided" })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded) {
            return res.status(401).json({ message: "invalid token" })
        }
        req.user = {
            id: decoded.id,
            email: decoded.email
        }

        // Validate that id is a valid UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!req.user.id || typeof req.user.id !== 'string' || !uuidRegex.test(req.user.id)) {
            return res.status(401).json({ message: "invalid token payload" })
        }

        next()
    }
    catch (err) {
        console.error("error in auth middleware:", err)
        res.status(401).json({ message: "authentication failed" })
    }
}

export default authMiddleware

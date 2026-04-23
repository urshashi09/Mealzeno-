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
        next()
    }
    catch (err) {
        console.error("error in auth middleware:", err)
        res.status(401).json({ message: "authentication failed" })
    }
}

export default authMiddleware

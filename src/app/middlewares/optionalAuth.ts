import { NextFunction, Request, Response } from "express";
import { jwtHelper } from "../helper/jwtHelper";
import config from "../../config";
import { Secret } from "jsonwebtoken";

const optionalAuth = () => {
    return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
        try {
            const token = req.cookies.accessToken;

            if (token) {
                try {
                    const verifyUser = jwtHelper.verifyToken(
                        token, 
                        config.jwt.jwt_secret as Secret
                    ) as { email: string; role: string; userId: string };
                    req.user = verifyUser;
                } catch (err) {
                    // Invalid token, continue without user
                    req.user = undefined;
                }
            }
            // No token or invalid token - continue without user
            next();
        } catch (err) {
            // On any error, continue without user
            next();
        }
    };
};

export default optionalAuth;


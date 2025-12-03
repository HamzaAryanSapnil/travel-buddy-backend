import { TAuthUser } from "../../app/modules/user/user.interface";

declare global {
    namespace Express {
        // Extends Express Request Type
        interface Request {
            user?: TAuthUser;
        }
    }
}

export { };



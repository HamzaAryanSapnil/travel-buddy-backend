"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const uploadPath = path_1.default.join(process.cwd(), "uploads");
const storage = multer_1.default.diskStorage({
    destination: (_, __, cb) => {
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (_, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const sanitizedName = file.originalname.replace(/\s+/g, "-");
        cb(null, `${file.fieldname}-${uniqueSuffix}-${sanitizedName}`);
    }
});
exports.upload = (0, multer_1.default)({ storage });

import fs from "fs";
import path from "path";
import multer from "multer";

const uploadPath = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (_, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const sanitizedName = file.originalname.replace(/\s+/g, "-");
        cb(null, `${file.fieldname}-${uniqueSuffix}-${sanitizedName}`);
    }
});

export const upload = multer({ storage });



"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const upload_1 = require("../../middlewares/upload");
const media_controller_1 = require("./media.controller");
const media_validation_1 = require("./media.validation");
const media_constant_1 = require("./media.constant");
const router = express_1.default.Router();
// Upload media (multiple files)
router.post("/", (0, auth_1.default)("USER", "ADMIN"), upload_1.upload.array("files", media_constant_1.maxFilesPerUpload), (0, validateRequest_1.default)(media_validation_1.MediaValidation.uploadMedia), media_controller_1.MediaController.uploadMedia);
// Get single media
router.get("/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(media_validation_1.MediaValidation.getMedia), media_controller_1.MediaController.getMedia);
// Get media list
router.get("/", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(media_validation_1.MediaValidation.getMediaList), media_controller_1.MediaController.getMediaList);
// Delete media
router.delete("/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(media_validation_1.MediaValidation.deleteMedia), media_controller_1.MediaController.deleteMedia);
exports.MediaRoutes = router;

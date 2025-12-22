"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const media_controller_1 = require("./media.controller");
const media_validation_1 = require("./media.validation");
const optionalAuth_1 = __importDefault(require("../../middlewares/optionalAuth"));
const router = express_1.default.Router();
// Upload media (multiple image URLs)
router.post("/", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(media_validation_1.MediaValidation.uploadMedia), media_controller_1.MediaController.uploadMedia);
// Public gallery (homepage) - NO AUTH REQUIRED
router.get("/public/gallery", (0, validateRequest_1.default)(media_validation_1.MediaValidation.getPublicGallery), media_controller_1.MediaController.getPublicGallery);
// Get media list
router.get("/", (0, optionalAuth_1.default)(), (0, validateRequest_1.default)(media_validation_1.MediaValidation.getMediaList), media_controller_1.MediaController.getMediaList);
// Get single media
router.get("/:id", (0, optionalAuth_1.default)(), (0, validateRequest_1.default)(media_validation_1.MediaValidation.getMedia), media_controller_1.MediaController.getMedia);
// Delete media
router.delete("/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(media_validation_1.MediaValidation.deleteMedia), media_controller_1.MediaController.deleteMedia);
exports.MediaRoutes = router;

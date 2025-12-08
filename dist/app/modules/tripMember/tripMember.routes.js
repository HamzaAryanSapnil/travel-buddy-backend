"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripMemberRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const tripMember_controller_1 = require("./tripMember.controller");
const tripMember_validation_1 = require("./tripMember.validation");
const router = express_1.default.Router();
router.post("/:planId/add", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(tripMember_validation_1.TripMemberValidation.addMember), tripMember_controller_1.TripMemberController.addMember);
router.get("/:planId", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(tripMember_validation_1.TripMemberValidation.getMembers), tripMember_controller_1.TripMemberController.getMembers);
router.patch("/:planId/update-role", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(tripMember_validation_1.TripMemberValidation.updateRole), tripMember_controller_1.TripMemberController.updateMemberRole);
router.delete("/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(tripMember_validation_1.TripMemberValidation.removeMember), tripMember_controller_1.TripMemberController.removeMember);
exports.TripMemberRoutes = router;

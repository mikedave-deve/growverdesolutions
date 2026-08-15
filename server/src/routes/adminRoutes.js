import { Router } from "express";
import {
  listPendingUsers, approveUser, rejectUser, listEmployees, updateEmployeeProfile,
} from "../controllers/adminController.js";
import {
  listEmployeeDocuments, uploadEmployeeDocument, updateEmployeeDocument,
} from "../controllers/adminDocumentController.js";
import { listEmployeeMissions, sendMission } from "../controllers/adminMissionController.js";
import {
  getEmployeeCurrentPay, updateEmployeeCurrentPay, listEmployeePayHistory, addEmployeePayHistory,
} from "../controllers/adminPayrollController.js";
import {
  listEmployeeShipments, createShipment, getShipment, updateShipment, deleteShipment,
} from "../controllers/adminLogisticsController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { documentUpload, shipmentPhotoUpload } from "../middleware/uploadMiddleware.js";
import { ADMIN_ROLES } from "../utils/roles.js";

const router = Router();

// Every route here requires a signed-in admin/HR account.
router.use(requireAuth, requireRole(...ADMIN_ROLES));

router.get("/users/pending", listPendingUsers);
router.post("/users/:id/approve", approveUser);
router.post("/users/:id/reject", rejectUser);
router.get("/users/employees", listEmployees);
router.patch("/users/:id/employment", updateEmployeeProfile);

router.get("/users/:id/documents", listEmployeeDocuments);
router.post("/users/:id/documents", documentUpload, uploadEmployeeDocument);
router.patch("/documents/:docId", documentUpload, updateEmployeeDocument);

router.get("/users/:id/missions", listEmployeeMissions);
router.post("/users/:id/missions", sendMission);

router.get("/users/:id/payroll/current", getEmployeeCurrentPay);
router.patch("/users/:id/payroll/current", updateEmployeeCurrentPay);
router.get("/users/:id/payroll/history", listEmployeePayHistory);
router.post("/users/:id/payroll/history", addEmployeePayHistory);

router.get("/users/:id/shipments", listEmployeeShipments);
router.post("/users/:id/shipments", shipmentPhotoUpload, createShipment);
router.get("/shipments/:shipmentId", getShipment);
router.patch("/shipments/:shipmentId", shipmentPhotoUpload, updateShipment);
router.delete("/shipments/:shipmentId", deleteShipment);

export default router;

import express from 'express';
import { verifyToken, authorizeRoles } from '../middlewares/auth.js';
import { createRecord, getRecords, updateRecord, deleteRecord } from '../controllers/recordController.js';
import { validate } from '../middlewares/validate.js';
import { createRecordSchema } from '../validators/schemas.js';

const router = express.Router();
//view records
router.get('/', verifyToken, authorizeRoles('Admin', 'Analyst'), getRecords);

//create record (Admin only)
router.post('/', verifyToken, authorizeRoles('Admin'), validate(createRecordSchema), createRecord);
router.put('/:id', verifyToken, authorizeRoles('Admin'), updateRecord);
router.delete('/:id', verifyToken, authorizeRoles('Admin'), deleteRecord);

export default router;
import express from 'express';
import { getUsers, updateUser, deleteUser } from '../controllers/userController.js';
import { verifyToken, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles('Admin'));

router.route('/')
    .get(getUsers);

router.route('/:id')
    .put(updateUser)
    .delete(deleteUser);

export default router;
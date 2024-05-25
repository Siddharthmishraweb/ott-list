import { Router } from 'express';
import { addItem, removeItem, listItems } from '../controllers/listController';

const router = Router();

router.post('/mylist', addItem);
router.delete('/mylist/:userId/:contentId', removeItem);
router.get('/mylist/:userId', listItems);

export default router;

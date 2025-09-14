import express from 'express';

import { auth } from "../middleware/auth.js";
import { getHelpSupport, getPrivacyPolicy, getTermsConditions, updateHelpSupport, updatePrivacyPolicy, updateTermsConditions } from '../controllers/legel_doc_controller.js';
const router = express.Router();


router.get('/privacypolicy', getPrivacyPolicy);
router.get('/terms&conditions', getTermsConditions);
router.get('/helpSupport', getHelpSupport);

router.put('/privacypolicy', auth, updatePrivacyPolicy);
router.put('/terms&conditions', auth, updateTermsConditions);
router.put('/helpSupport', auth, updateHelpSupport);

export default router;


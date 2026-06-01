import { Router } from 'express';

import ligaRoutes from './liga.routes.js';
import clubRoutes from './club.routes.js';
import jugadorRoutes from './jugador.routes.js';
import nacionalidadRoutes from './nacionalidad.routes.js';
import posicionRoutes from './posicion.routes.js';
import skillRoutes from './skill.routes.js';
import versionRoutes from './version.routes.js';
import authRoutes from './auth.routes.js';
import iaRoutes from './ia.routes.js';

const router = Router();

router.use('/liga', ligaRoutes);
router.use('/club', clubRoutes);
router.use('/auth', authRoutes);
router.use('/jugador', jugadorRoutes);
router.use('/nacionalidad', nacionalidadRoutes);
router.use('/posicion', posicionRoutes);
router.use('/ia', iaRoutes);
router.use('/skill', skillRoutes);
router.use('/version', versionRoutes);
export default router;
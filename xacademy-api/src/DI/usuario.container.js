import UsuarioRepository from '../repositories/usuario.repository.js';
import UsuarioService from '../services/usuario.service.js';
import UsuarioController from '../controllers/usuario.controller.js';

// 1. Instanciamos el repositorio (capa más profunda)
const usuarioRepository = new UsuarioRepository();

// 2. Instanciamos el servicio inyectándole el repositorio
const usuarioService = new UsuarioService(usuarioRepository);

// 3. Instanciamos el controlador inyectándole el servicio
const usuarioController = new UsuarioController(usuarioService);

// 4. Exportamos el controlador listo para conectarse a Express
export default usuarioController;
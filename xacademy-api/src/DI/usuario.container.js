import UsuarioRepository from '../repositories/usuario.repository.js';
import UsuarioService from '../services/usuario.service.js';
import UsuarioController from '../controllers/usuario.controller.js';

const usuarioRepository = new UsuarioRepository();
const usuarioService = new UsuarioService(usuarioRepository);
const usuarioController = new UsuarioController(usuarioService);

export default usuarioController;
import BaseRepository from '../core/base.repository.js';
import {UsuarioModel}   from '../db/models/index.js';

class AuthRepository extends BaseRepository {
  constructor() {
    super(UsuarioModel);
  }

  async findByEmail(email) {
    return await this.findByField('Email', email);
  }
}

export default AuthRepository;
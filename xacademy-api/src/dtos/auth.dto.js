export class RegisterDto {
  constructor({ Nombre, Apellido, NombreUsuario, Email, Pwd }) {
    this.Nombre        = Nombre?.trim();
    this.Apellido      = Apellido?.trim();
    this.NombreUsuario = NombreUsuario?.trim();
    this.Email         = Email?.trim().toLowerCase();
    this.Pwd           = Pwd;
  }
}

export class LoginDto {
  constructor({ Email, Pwd }) {
    this.Email = Email?.trim().toLowerCase();
    this.Pwd   = Pwd;
  }
}

export class UsuarioResponseDto {
  constructor(user) {
    this.nombre        = user.Nombre;
    this.apellido      = user.Apellido;
    this.nombreUsuario = user.NombreUsuario;
    this.email         = user.Email;
  }
}
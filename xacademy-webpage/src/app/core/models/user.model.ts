export interface User {
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  email: string;
}

export interface RegisterDto {
  Nombre: string;
  Apellido: string;
  NombreUsuario: string;
  Email: string;
  Pwd: string;
}

export interface LoginDto {
  Email: string;
  Pwd: string;
}
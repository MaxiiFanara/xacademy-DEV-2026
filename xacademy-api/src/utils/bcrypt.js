import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashPassword  = (password)=> bcrypt.hashSync(password, SALT_ROUNDS);
export const comparePassword = (password, hashedPassword) => bcrypt.compareSync(password, hashedPassword);
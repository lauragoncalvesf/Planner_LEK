
import bcrypt from "bcryptjs";
import { userRepository } from "@/backend/repositories/userRepository";
import type { RegisterInput } from "@/backend/validators/registerValidator";

export class EmailAlreadyExistsError extends Error {
  constructor() {
    super("Este e-mail já está cadastrado.");
  }
}

export const userService = {
  async register(data: RegisterInput) {
    const existingUser = await userRepository.findByEmail(
      data.email
    );

    if (existingUser) {
      throw new EmailAlreadyExistsError();
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    return userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
    });
  },
};

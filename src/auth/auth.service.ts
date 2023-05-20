import { Injectable } from '@nestjs/common';
import { AuthResponse } from './types/auth-response.type';
import { SignupInput } from './dto/inputs/signup.input';

@Injectable()
export class AuthService {
  async signup(signupInput: SignupInput): Promise<AuthResponse> {
    console.log({ signupInput });
    throw new Error('signup not implemented');
  }
}

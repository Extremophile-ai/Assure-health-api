export interface TokenPayload {
  user?: any;
  createUser?: any;
}

export interface JWTConfig {
  secret: string;
  expiresIn?: string;
}

export interface AuthMiddlewareRequest {
  headers: {
    authorization?: string;
  };
}

export interface DecodedToken {
  user: {
    id: string;
    email: string;
    role: string;
  };
  createUser?: any;
  iat?: number;
  exp?: number;
}

// src/types/auth.ts
export interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    roleId: string;
    isActive: boolean;
    lastLogin: string;
    createdAt: string;
    updatedAt: string;
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export interface Role {
    name: string;
    permissions: string[];
}

export interface LoginResponse {
    success: boolean;
    data: {
        user: User;
        tokens: Tokens;
        role: Role;
    };
}
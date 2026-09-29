import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser } from '../types';
import { StorageService } from '../services/storageService';
import { cleanCpfCnpj } from '../utils/formatters';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  loginClient: (cpfCnpj: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AUTH_USER_KEY = 'jgcode_auth_user';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restaurar sessão salva
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Erro ao restaurar sessão:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAdmin = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Verificar na base de usuários cadastrados no sistema
    const registeredUser = StorageService.findUserByEmail(normalizedEmail);
    if (registeredUser) {
      if (registeredUser.status === 'INACTIVE') {
        return {
          success: false,
          message: 'Seu usuário está inativo no momento. Entre em contato com a administração da JGcode.',
        };
      }

      if (registeredUser.password && registeredUser.password !== pass) {
        return {
          success: false,
          message: 'Senha incorreta. Verifique suas credenciais.',
        };
      }

      // Atualiza data do último login
      StorageService.updateUserLastLogin(registeredUser.id);

      const adminUser: AuthUser = {
        uid: registeredUser.id,
        email: registeredUser.email,
        name: registeredUser.name,
        role: 'admin',
        adminRole: registeredUser.role,
      };

      setUser(adminUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(adminUser));
      return { success: true };
    }

    // 2. Fallback de teste para admin padrão
    if (normalizedEmail === 'admin@jgcode.com' && pass === 'admin123') {
      const adminUser: AuthUser = {
        uid: 'user-1',
        email: 'admin@jgcode.com',
        name: 'Wandeson Silva (Admin)',
        role: 'admin',
        adminRole: 'SUPER_ADMIN',
      };
      setUser(adminUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(adminUser));
      return { success: true };
    }

    // 3. Permitir qualquer login com formato de email válido para teste rápido
    if (email.includes('@') && pass.length >= 6) {
      const adminUser: AuthUser = {
        uid: `admin-${Date.now()}`,
        email,
        name: 'Equipe JGcode',
        role: 'admin',
        adminRole: 'SUPER_ADMIN',
      };
      setUser(adminUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(adminUser));
      return { success: true };
    }

    return {
      success: false,
      message: 'Credenciais inválidas. Dica: use admin@jgcode.com e senha admin123',
    };
  };

  const loginClient = async (cpfCnpjInput: string): Promise<{ success: boolean; message?: string }> => {
    const cleaned = cleanCpfCnpj(cpfCnpjInput);
    if (!cleaned) {
      return { success: false, message: 'Por favor, informe seu CPF ou CNPJ.' };
    }

    // Busca o cliente cadastrado pelo administrador
    const client = StorageService.findClientByCpfCnpj(cleaned);

    if (!client) {
      return {
        success: false,
        message: 'CPF ou CNPJ não encontrado no sistema. Verifique os dados ou contate a JGcode.',
      };
    }

    if (!client.active) {
      return {
        success: false,
        message: 'Cadastro inativo. Por favor, entre em contato com o suporte da JGcode.',
      };
    }

    const clientUser: AuthUser = {
      uid: `client-${client.id}`,
      name: client.name,
      email: client.email,
      role: 'client',
      clientId: client.id,
      cpfCnpj: client.cpfCnpj,
    };

    setUser(clientUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(clientUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginAdmin, loginClient, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import { useState, useCallback } from "react";

interface User {
  name: string;
  email: string;
  phone: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("edt-user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback((email: string, _password: string) => {
    const u: User = { name: email.split("@")[0], email, phone: "(732) 555-0100" };
    localStorage.setItem("edt-user", JSON.stringify(u));
    setUser(u);
  }, []);

  const register = useCallback((name: string, email: string, phone: string, _password: string) => {
    const u: User = { name, email, phone };
    localStorage.setItem("edt-user", JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("edt-user");
    setUser(null);
  }, []);

  return { user, login, register, logout };
}

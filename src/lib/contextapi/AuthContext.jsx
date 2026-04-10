// import { createContext, useContext, useEffect, useState } from "react";
// import authService from "../../api_services/authService";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const storedUser = authService.getCurrentUser();
//     if (storedUser) {
//       setUser(storedUser);
//     }
//   }, []);

//   const login = async (username, password) => {
//     const response = await authService.login(username, password);

//     // əgər authService login zamanı localStorage yazmırsa, burada yaz
//     localStorage.setItem("accessToken", response.accessToken);
//     localStorage.setItem("refreshToken", response.refreshToken);
//     localStorage.setItem("user", JSON.stringify(response.user));

//     setUser(response.user); // 🔥 BU ƏSASDIR
//     return response.user;
//   };

//   const logout = () => {
//     localStorage.clear();
//     setUser(null);
//   };

//   const isAdmin = user?.roles?.some(r => r.name === "ADMIN");

//   return (
//     <AuthContext.Provider value={ { user, login, logout, isAdmin } }>
//       { children }
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

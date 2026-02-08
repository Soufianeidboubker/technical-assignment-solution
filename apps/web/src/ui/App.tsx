import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Board from '../pages/Board';

export function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/board/:boardId" 
        element={isAuthenticated ? <Board /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/board/1" : "/login"} />} 
      />
    </Routes>
  );
}
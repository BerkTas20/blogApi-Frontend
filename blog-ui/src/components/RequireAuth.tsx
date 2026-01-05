import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

type RequireAuthProps = {
  children: ReactNode;
};

export default function RequireAuth({ children }: RequireAuthProps) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

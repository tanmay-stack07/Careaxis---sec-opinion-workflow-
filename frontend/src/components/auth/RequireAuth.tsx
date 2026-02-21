import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isDemoAuthed } from "@/lib/demo-auth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  if (!isDemoAuthed()) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

import { type FC } from "react";
import { Routes, Route, Navigate } from "react-router";
import LoginPage from "@growchief/frontend/pages/auth/login.tsx";
import RegisterPage from "@growchief/frontend/pages/auth/register.tsx";
import ForgotPasswordPage from "@growchief/frontend/pages/auth/forgot-password.tsx";
import ResetPasswordPage from "@growchief/frontend/pages/auth/forgot-token.tsx";
import ActivatePage from "@growchief/frontend/pages/auth/continue.tsx";
import ActivateTokenPage from "@growchief/frontend/pages/auth/activate-token.tsx";
import AuthWrapper from "@growchief/frontend/pages/auth/auth.wrapper.tsx";

export const AuthLayout: FC = () => {
  return (
    <AuthWrapper>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/forgot/:token" element={<ResetPasswordPage />} />
        <Route path="/auth/continue" element={<ActivatePage />} />
        <Route path="/auth/activate/:token" element={<ActivateTokenPage />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </AuthWrapper>
  );
};

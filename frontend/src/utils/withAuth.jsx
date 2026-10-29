import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../pages/contexts/AuthContext.jsx";

const withAuth = (WrappedComponent) => {
  return function ProtectedComponent(props) {
    const { userData } = useContext(AuthContext);
    const token = localStorage.getItem("token");

    if (!token) {
      return <Navigate to="/login" replace />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;

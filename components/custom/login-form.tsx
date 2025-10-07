"use client";
import React, { useState } from "react";

const LoginForm: React.FC = () => {
  const [user] = useState<{ name: string } | null>(null);

  const handleSSOLogin = async () => {
    // Redirect to your backend SSO endpoint
    window.location.href = "https://iom-ppo-directus-dev.iom.int/auth/login/azure?redirect=http://localhost:3000/callback";

    // go home

    //router.push("/");
  };

  return (
    <div>
      {!user ? (
        <div>
          <button
            onClick={handleSSOLogin}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            className="hover:bg-brand-100 hover:brand-500 transition border border-brand-300 hover:text-brand-500 font-semibold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              style={{ width: "20px", height: "20px", marginRight: "10px" }}
            >
              <rect x="0" y="0" width="216" height="216" fill="#F25022" />
              <rect x="232" y="0" width="216" height="216" fill="#7FBA00" />
              <rect x="0" y="232" width="216" height="216" fill="#00A4EF" />
              <rect x="232" y="232" width="216" height="216" fill="#FFB900" />
            </svg>
            Login in with IOM Account
          </button>
        </div>
      ) : (
        <div className="bg-gray-100 p-4 rounded">
          <h2>
            Welcome, <span className="font-bold">{user.name}</span>!
          </h2>
        </div>
      )}
    </div>
  );
};

export default LoginForm;

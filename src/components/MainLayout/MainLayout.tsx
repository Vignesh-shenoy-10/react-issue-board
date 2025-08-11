import React from "react";
import { Navigation } from "../Navigation";
import RecentlyAccessedSidebar from "../RecentlyAccessedSidebar/RecentlyAccessedSidebar";

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Navigation />
        <div style={{ flex: 1, display: "flex" }}>
          <div style={{ flex: 1, padding: "16px" }}>{children}</div>
          <RecentlyAccessedSidebar />
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { useIssues } from "../context/IssuesContext";
import { useTheme } from "../context/ThemeContext";

export const SettingsPage: React.FC = () => {
  const { pollingIntervalMs, setPollingIntervalMs } = useIssues();
  const { theme, toggleTheme } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let secs = Number(e.target.value);
    if (isNaN(secs) || secs < 5) secs = 5;
    setPollingIntervalMs(secs * 1000);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Settings</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Polling Interval (seconds): &nbsp;
          <input
            type="number"
            value={pollingIntervalMs / 1000}
            onChange={handleChange}
            min={5}
            style={{ width: "80px" }}
          />
        </label>
        <p style={{ fontSize: "0.85rem", color: "#555" }}>
          Controls how often the issue list is refreshed automatically.
        </p>
      </div>
      <div style={{ marginTop: 20 }}>
        <label>
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={toggleTheme}
          />
          &nbsp; Enable Dark Mode
        </label>
      </div>
    </div>
  );
};

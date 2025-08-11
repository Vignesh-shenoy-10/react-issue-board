import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useIssues } from "../../context/IssuesContext";
import "./RecentlyAccessedSidebar.css";

const STORAGE_KEY = "recentSidebarOpen";

const RecentlyAccessedSidebar: React.FC = () => {
  const { recentlyAccessed, issues } = useIssues();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsOpen(stored === "true");
    }
  }, []);

  const recentIssues = recentlyAccessed
    .map((id) => issues.find((issue) => issue.id === id))
    .filter(Boolean);

  if (!recentIssues.length) {
    return (
      <aside className={`recent-sidebar collapsed`}>
        <button
          className="toggle-btn always-visible"
          onClick={() => {
            setIsOpen(true);
            localStorage.setItem(STORAGE_KEY, "true");
          }}
          title="Expand"
        >
          ‹
        </button>
      </aside>
    );
  }

  const toggleSidebar = () => {
    const next = !isOpen;
    setIsOpen(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  return (
    <aside className={`recent-sidebar ${isOpen ? "open" : "collapsed"}`}>
      <button
        className="toggle-btn always-visible"
        onClick={toggleSidebar}
        title={isOpen ? "Collapse" : "Expand"}
      >
        {isOpen ? "›" : "‹"}
      </button>
      {isOpen && (
        <div className="recent-content">
          <h3 className="recent-title">Recently Accessed</h3>
          <ul className="recent-list">
            {recentIssues.map((issue) => (
              <li key={issue!.id} className="recent-item">
                <Link to={`/issue/${issue!.id}`} className="recent-link">
                  <span
                    className={`status-dot status-${issue!.status
                      .replace(" ", "")
                      .toLowerCase()}`}
                  />
                  {issue!.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
};

export default RecentlyAccessedSidebar;

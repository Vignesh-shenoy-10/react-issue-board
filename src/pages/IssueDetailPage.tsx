import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIssues } from "../context/IssuesContext";


const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { issues, updateIssue } = useIssues();

  const issue = issues.find(issue => issue.id === id);

  if (!issue) return <div>Issue not found.</div>;

  const markAsResolved = () => {
    if (issue.status === "Done") return;
    updateIssue(issue.id, { status: "Done" });
    navigate("/");
  };

  return (
    <div className="issue-detail-container">
      {/* ... rest of your rendering ... */}
    </div>
  );
};

export default IssueDetailPage;

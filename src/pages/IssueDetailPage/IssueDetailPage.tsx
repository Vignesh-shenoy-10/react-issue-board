import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIssues } from "../../context/IssuesContext";
import { IssueStatus } from "../../types";
import { toast, Slide } from "react-toastify";
import "./IssueDetailPage.css";

const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { issues, updateIssue, addToRecentlyAccessed } = useIssues();

  const issue = issues.find((i) => i.id === id);

  useEffect(() => {
    if (id) {
      addToRecentlyAccessed(id);
    }
  }, [id, addToRecentlyAccessed]);

  if (!issue) {
    return <div className="issue-not-found">Issue not found.</div>;
  }

  const markAsResolved = () => {
    if (issue.status === "Done") return;

    updateIssue(issue.id, { status: "Done" as IssueStatus });
    toast.dismiss();
    toast(
      ({ closeToast }) => (
        <div className="undo-toast">
          <span className="toast-icon-circle">✔</span>
          <span className="toast-msg">
            Issue <b>{issue.title}</b> marked as resolved.
          </span>
          <button
            className="undo-btn"
            onClick={() => {
              updateIssue(issue.id, { status: issue.status });
              closeToast?.();
            }}
          >
            ⤺ Undo
          </button>
        </div>
      ),
      {
        autoClose: 5000,
        closeButton: false,
        position: "bottom-right",
        transition: Slide,
        style: {
          background: "none",
          boxShadow: "none",
          padding: 0,
          minHeight: 0,
          border: "none",
        },
      }
    );

    navigate("/", { replace: true });
  };

  return (
    <div className="issue-detail-container">
      <h1>{issue.title}</h1>
      <p>
        <strong>Description:</strong>{" "}
        {issue.description || "(No description provided)"}
      </p>

      <div className="issue-detail-row">
        <strong>Assignee:</strong> {issue.assignee}
      </div>
      <div className="issue-detail-row">
        <strong>Priority:</strong> {issue.priority}
      </div>
      <div className="issue-detail-row">
        <strong>Severity:</strong> {issue.severity}
      </div>
      <div className="issue-detail-row">
        <strong>Status:</strong> {issue.status}
      </div>
      <div className="issue-detail-row">
        <strong>Created At:</strong>{" "}
        {new Date(issue.createdAt).toLocaleString()}
      </div>

      <div className="issue-detail-row tags">
        <strong>Tags:</strong>{" "}
        {issue.tags?.length
          ? issue.tags.map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))
          : "(None)"}
      </div>

      <button
        className="mark-resolved-btn"
        onClick={markAsResolved}
        disabled={issue.status === "Done"}
        title={
          issue.status === "Done"
            ? "Issue already resolved"
            : "Mark as Resolved"
        }
      >
        Mark as Resolved
      </button>
    </div>
  );
};

export default IssueDetailPage;

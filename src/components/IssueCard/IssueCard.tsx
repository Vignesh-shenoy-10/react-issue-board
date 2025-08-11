import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Link } from "react-router-dom";
import { Issue, IssueStatus } from "../../types";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import "./IssueCard.css";

interface IssueCardProps {
  issue: Issue;
  index: number;
  onMove?: (id: string, dir: "left" | "right") => void;
  isDragDisabled?: boolean;
}

const columns: IssueStatus[] = ["Backlog", "In Progress", "Done"];
const normalizeStatus = (status: string) => status.trim().toLowerCase();

const getInitials = (name: string) => name?.charAt(0).toUpperCase() || "?";

const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  index,
  onMove,
  isDragDisabled = false,
}) => {
  const currentIndex = columns.findIndex(
    (col) => normalizeStatus(col) === normalizeStatus(issue.status)
  );
  const canMoveLeft = currentIndex > 0;
  const canMoveRight = currentIndex < columns.length - 1;
  const readOnlyTooltip = isDragDisabled ? "Read-only mode: Cannot modify" : "";

  return (
    <Draggable
      draggableId={issue.id}
      index={index}
      isDragDisabled={isDragDisabled}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...(!isDragDisabled ? provided.dragHandleProps : {})}
          className={`issue-card${snapshot.isDragging ? " dragging" : ""}${
            isDragDisabled ? " disabled" : ""
          }`}
          style={{
            ...provided.draggableProps.style,
            opacity: isDragDisabled ? 0.6 : 1,
            cursor: isDragDisabled ? "not-allowed" : "grab",
          }}
          title={readOnlyTooltip}
        >
          <Link
            to={`/issue/${issue.id}`}
            className="issue-card-content"
            tabIndex={0}
            style={{
              textDecoration: "none",
              color: "inherit",
              flex: 1,
            }}
          >
            <div className="card-header">
              <div className={`priority-badge priority-${issue.priority}`}>
                {issue.priority}
              </div>
            </div>
            <div className="issue-title">{issue.title}</div>

            {issue.tags?.length > 0 && (
              <div className="tag-list">
                {issue.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`tag-pill tag-${tag.toLowerCase()}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="issue-meta">
              <div className="assignee-group" title={issue.assignee}>
                <span className="assignee-avatar">
                  {getInitials(issue.assignee)}
                </span>
                <span className="assignee-name">{issue.assignee}</span>
              </div>
              <span className="meta-label">Severity: {issue.severity}</span>
              <span className="meta-label">
                {new Date(issue.createdAt).toLocaleDateString()}
              </span>
            </div>
          </Link>

          {onMove && (
            <div className="card-footer">
              <div className="card-actions">
                <button
                  className="move-btn trello-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove(issue.id, "left");
                  }}
                  disabled={!canMoveLeft || isDragDisabled}
                  title={readOnlyTooltip || "Move Left"}
                >
                  <FiArrowLeft />
                </button>
                <button
                  className="move-btn trello-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove(issue.id, "right");
                  }}
                  disabled={!canMoveRight || isDragDisabled}
                  title={readOnlyTooltip || "Move Right"}
                >
                  <FiArrowRight />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default IssueCard;

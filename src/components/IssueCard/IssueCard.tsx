import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Issue, IssueStatus } from "../../types";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import "./IssueCard.css";

interface IssueCardProps {
  issue: Issue;
  index: number;
  onMove: (id: string, dir: "left" | "right") => void;
}

const columns: IssueStatus[] = ["Backlog", "In Progress", "Done"];
const getInitials = (name: string) => name?.charAt(0).toUpperCase() || "?";

const IssueCard: React.FC<IssueCardProps> = ({ issue, index, onMove }) => {
  const currentIndex = columns.indexOf(issue.status);
  const canMoveLeft = currentIndex > 0;
  const canMoveRight = currentIndex < columns.length - 1;

  return (
    <Draggable draggableId={issue.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`issue-card${snapshot.isDragging ? " dragging" : ""}`}
          style={provided.draggableProps.style}
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
                <span key={tag} className={`tag-pill tag-${tag.toLowerCase()}`}>
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

          <div className="card-footer">
            <div className="card-actions">
              <button
                className="move-btn trello-btn"
                onClick={() => onMove(issue.id, "left")}
                disabled={!canMoveLeft}
                title="Move Left"
              >
                <FiArrowLeft />
              </button>
              <button
                className="move-btn trello-btn"
                onClick={() => onMove(issue.id, "right")}
                disabled={!canMoveRight}
                title="Move Right"
              >
                <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default IssueCard;

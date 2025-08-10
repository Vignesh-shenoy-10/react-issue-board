import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Issue, IssueStatus } from "../../types";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import './IssueCard.css'

interface IssueCardProps {
  issue: Issue;
  index: number;
  onMove: (id: string, dir: "left" | "right") => void;
}

const columns: IssueStatus[] = ["Backlog", "In Progress", "Done"];

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
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "10px",
            backgroundColor: snapshot.isDragging ? "#ffe082" : "#fff",
            ...provided.draggableProps.style,
          }}
        >
          <h4 style={{ margin: 0 }}>{issue.title}</h4>
          <p style={{ fontSize: "0.85rem", margin: "5px 0", color: "#666" }}>
            <strong>Assignee:</strong> {issue.assignee} &nbsp;|&nbsp;
            <strong>Priority:</strong> {issue.priority} &nbsp;|&nbsp;
            <strong>Severity:</strong> {issue.severity}
          </p>
          <p style={{ fontSize: "0.8rem", color: "#777", marginBottom: "4px" }}>
            <strong>Created:</strong>{" "}
            {new Date(issue.createdAt).toLocaleDateString()}
          </p>
          <div>
            {issue.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "inline-block",
                  background: "#eee",
                  color: "#555",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  padding: "2px 6px",
                  marginRight: "4px",
                  marginBottom: "2px",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
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
      )}
    </Draggable>
  );
};

export default IssueCard;

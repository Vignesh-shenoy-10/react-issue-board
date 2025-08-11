import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Issue, IssueStatus } from "../../types";
import IssueCard from "../IssueCard/IssueCard";

interface IssueColumnProps {
  title: string;
  status: IssueStatus;
  issues: Issue[];
  onMove: (id: string, dir: "left" | "right") => void;
}

const IssueColumn: React.FC<IssueColumnProps> = ({ title, status, issues, onMove }) => {
  return (
    <Droppable droppableId={status}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{
            flex: 1,
            padding: "10px",
            backgroundColor: snapshot.isDraggingOver ? "#b3e5fc" : "#f4f5f7",
            margin: "0 5px",
            borderRadius: "8px",
            minHeight: "400px",
            display: "flex",
            flexDirection: "column",
            transition: "background 0.24s"
          }}
        >
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px"
          }}>
            <h3 style={{ margin: 0 }}>{title}</h3>
            <span style={{ color: "#555", fontSize: "0.85rem" }}>{issues.length}</span>
          </div>

          <div style={{ flex: 1 }}>
            {issues.length > 0 ? (
              issues.map((issue, index) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  index={index}
                  onMove={onMove}
                />
              ))
            ) : (
              <p style={{ textAlign: "center", color: "#888", fontSize: "0.9rem" }}>
                No issues in {title}
              </p>
            )}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default IssueColumn;

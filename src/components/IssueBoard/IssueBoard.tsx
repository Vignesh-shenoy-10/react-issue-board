import React, { useState, useEffect, useRef } from "react";
import rawIssuesData from "../../data/issues.json";
import { Issue, IssueStatus, IssuePriority } from "../../types";
import IssueColumn from "../IssueColumn";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { toast, Slide } from "react-toastify";
import "./IssueBoard.css";

const columns: IssueStatus[] = ["Backlog", "In Progress", "Done"];

function parseStatus(s: string): IssueStatus {
  if (columns.includes(s as IssueStatus)) return s as IssueStatus;
  throw new Error(`Invalid status: ${s}`);
}
function parsePriority(p: string): IssuePriority {
  if (p === "low" || p === "medium" || p === "high") return p;
  throw new Error(`Invalid priority: ${p}`);
}

type LastAction = {
  issueId: string;
  fromStatus: IssueStatus;
  toStatus: IssueStatus;
  prevIssues: Issue[];
};

const IssueBoard: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const undoTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mapped: Issue[] = rawIssuesData.map(issue => ({
      ...issue,
      status: parseStatus(issue.status),
      priority: parsePriority(issue.priority),
    }));
    setIssues(mapped);
  }, []);

  const undoMoveDirect = (prevIssues: Issue[]) => {
    setIssues(prevIssues);
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
    toast.dismiss();
    toast.info("Issue move undone.", { autoClose: 2000 });
  };

 const triggerUndoToast = (action: LastAction) => {
  toast.dismiss();
  toast(
    ({ closeToast }) => (
      <div className="undo-toast">
        {/* Yellow circle with an "X" inside */}
        <span className="toast-icon-circle">✖</span>

        <span className="toast-msg">
          Issue moved from <b>{action.fromStatus}</b> to <b>{action.toStatus}</b>.
        </span>

        <button
          className="undo-btn"
          onClick={() => {
            undoMoveDirect(action.prevIssues); // restore snapshot
            closeToast && closeToast();
          }}
          title="Undo"
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
      style: { background: "none", boxShadow: "none", padding: 0, minHeight: 0, border: "none" }
    }
  );
};


  const performMove = (updatedIssues: Issue[], action: LastAction) => {
    setIssues(updatedIssues);
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
    undoTimeout.current = setTimeout(() => {
    }, 5000);
    triggerUndoToast(action);
  };


  const moveIssue = (id: string, direction: "left" | "right") => {
    setIssues(prev => {
      const prevState = [...prev]; 
      const issueToMove = prevState.find(i => i.id === id)!;
      const fromStatus = issueToMove.status;
      const newIndex = columns.indexOf(fromStatus) + (direction === "left" ? -1 : 1);
      const toStatus = columns[newIndex];

      const updated = prevState.map(issue =>
        issue.id === id ? { ...issue, status: toStatus } : issue
      );

      performMove(updated, { issueId: id, fromStatus, toStatus, prevIssues: prevState });
      return updated;
    });
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (
      !destination ||
      (destination.droppableId === source.droppableId && destination.index === source.index)
    ) return;

    setIssues(prev => {
      const prevState = [...prev];
      const movedIssue = prevState.find(issue => issue.id === draggableId)!;
      const fromStatus = source.droppableId as IssueStatus;
      const toStatus = destination.droppableId as IssueStatus;

      let newIssues = prevState.filter(issue => issue.id !== draggableId);
      const destColIssues = newIssues.filter(issue => issue.status === toStatus);
      destColIssues.splice(destination.index, 0, { ...movedIssue, status: toStatus });

      newIssues = [
        ...newIssues.filter(issue => issue.status !== toStatus),
        ...destColIssues,
      ];

      performMove(newIssues, { issueId: movedIssue.id, fromStatus, toStatus, prevIssues: prevState });
      return newIssues;
    });
  };

  const backlog = issues.filter(i => i.status === "Backlog");
  const inProgress = issues.filter(i => i.status === "In Progress");
  const done = issues.filter(i => i.status === "Done");

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{
        display: "flex",
        padding: "20px",
        background: "#e1e1e1",
        borderRadius: "10px",
      }}>
        <IssueColumn title="Backlog" status="Backlog" issues={backlog} onMove={moveIssue} />
        <IssueColumn title="In Progress" status="In Progress" issues={inProgress} onMove={moveIssue} />
        <IssueColumn title="Done" status="Done" issues={done} onMove={moveIssue} />
      </div>
    </DragDropContext>
  );
};

export default IssueBoard;

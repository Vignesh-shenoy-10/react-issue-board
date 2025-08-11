import React, { useRef, useState } from "react";
import { Issue, IssueStatus } from "../../types";
import IssueColumn from "../IssueColumn/IssueColumn";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { toast, Slide } from "react-toastify";
import "./IssueBoard.css";
import { useIssues } from "../../context/IssuesContext";

const columns: IssueStatus[] = ["Backlog", "In Progress", "Done"];

type LastAction = {
  issueId: string;
  fromStatus: IssueStatus;
  toStatus: IssueStatus;
  prevIssues: Issue[];
};

const IssueBoard: React.FC = () => {
  const { issues, setIssues } = useIssues(); // ⬅ get from context
  const undoTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // local UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<number | null>(null);

  const undoMoveDirect = (prevIssues: Issue[]) => {
    setIssues(prevIssues);
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
    toast.dismiss();
    toast.info("Issue move undone.", { autoClose: 2000 });
  };

  const triggerUndoToast = (action: LastAction) => {
    toast.dismiss();
    toast(({ closeToast }) => (
      <div className="undo-toast">
        <span className="toast-icon-circle">✖</span>
        <span className="toast-msg">
          Issue moved from <b>{action.fromStatus}</b> to{" "}
          <b>{action.toStatus}</b>.
        </span>
        <button
          className="undo-btn"
          onClick={() => {
            undoMoveDirect(action.prevIssues);
            closeToast?.();
          }}
        >
          ⤺ Undo
        </button>
      </div>
    ), {
      autoClose: 5000,
      closeButton: false,
      position: "bottom-right",
      transition: Slide,
      style: { background: "none", boxShadow: "none", padding: 0, minHeight: 0, border: "none" }
    });
  };

  const performMove = (updatedIssues: Issue[], action: LastAction) => {
    setIssues(updatedIssues);
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
    undoTimeout.current = setTimeout(() => {}, 5000);
    triggerUndoToast(action);
  };

  const moveIssue = (id: string, direction: "left" | "right") => {
    setIssues(prev => {
      const prevState = prev.map(i => ({ ...i }));
      const issueToMove = prevState.find(i => i.id === id)!;
      const fromStatus = issueToMove.status;
      const newIndex =
        columns.indexOf(fromStatus) + (direction === "left" ? -1 : 1);
      const toStatus = columns[newIndex];
      const updated = prevState.map(issue =>
        issue.id === id ? { ...issue, status: toStatus } : issue
      );
      performMove(updated, { issueId: id, fromStatus, toStatus, prevIssues: prevState });
      return updated;
    });
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    setIssues(prev => {
      const prevState = prev.map(issue => ({ ...issue }));
      const fromStatus = source.droppableId as IssueStatus;
      const toStatus = destination.droppableId as IssueStatus;

      const startCol = prevState.filter(issue => issue.status === fromStatus);
      const finishCol = prevState.filter(issue => issue.status === toStatus && toStatus !== fromStatus);
      const draggedIdx = startCol.findIndex(issue => issue.id === draggableId);

      if (draggedIdx === -1) return prevState;

      const draggedIssue = { ...startCol[draggedIdx] };
      startCol.splice(draggedIdx, 1);

      if (fromStatus === toStatus) {
        // Same-column reorder
        startCol.splice(destination.index, 0, draggedIssue);
        const newIssues: Issue[] = [];
        for (const issue of prevState) {
          if (issue.status === fromStatus) {
            newIssues.push(startCol.shift()!);
          } else {
            newIssues.push(issue);
          }
        }
        performMove(newIssues, {
          issueId: draggedIssue.id,
          fromStatus,
          toStatus,
          prevIssues: prevState
        });
        return newIssues;
      } else {
        // Cross-column move
        draggedIssue.status = toStatus;
        finishCol.splice(destination.index, 0, draggedIssue);
        const newIssues: Issue[] = [];
        for (const col of columns) {
          if (col === fromStatus) {
            newIssues.push(...startCol);
          } else if (col === toStatus) {
            newIssues.push(...finishCol);
          } else {
            newIssues.push(...prevState.filter(issue => issue.status === col));
          }
        }
        performMove(newIssues, {
          issueId: draggedIssue.id,
          fromStatus,
          toStatus,
          prevIssues: prevState
        });
        return newIssues;
      }
    });
  };

  const processedIssues = issues.filter(issue => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      issue.title.toLowerCase().includes(q) ||
      (issue.tags || []).some(tag => tag.toLowerCase().includes(q));
    const matchesAssignee = filterAssignee ? issue.assignee === filterAssignee : true;
    const matchesSeverity = filterSeverity ? issue.severity === filterSeverity : true;
    return matchesSearch && matchesAssignee && matchesSeverity;
  });

  const backlog = processedIssues.filter(i => i.status === "Backlog");
  const inProgress = processedIssues.filter(i => i.status === "In Progress");
  const done = processedIssues.filter(i => i.status === "Done");

  return (
    <>
      {/* Top filters/search */}
      <div className="controls-bar">
        <div className="input-with-icon">
          <span className="input-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by title or tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-bar"
          />
        </div>
        <div className="input-with-icon">
          <span className="input-icon">👤</span>
          <select
            className="filter-dropdown"
            value={filterAssignee || ""}
            onChange={e => setFilterAssignee(e.target.value || null)}
          >
            <option value="">All Assignees</option>
            {Array.from(new Set(issues.map(i => i.assignee))).map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="input-with-icon">
          <span className="input-icon">⚡</span>
          <select
            className="filter-dropdown severity-dropdown"
            value={filterSeverity?.toString() || ""}
            onChange={e => setFilterSeverity(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">All Severities</option>
            <option className="severity-low" value="1">🟢 1 (Low)</option>
            <option className="severity-medium" value="2">🟡 2 (Medium)</option>
            <option className="severity-high" value="3">🔴 3 (High)</option>
          </select>
        </div>
      </div>

      {/* Kanban board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board">
          <IssueColumn title="Backlog" status="Backlog" issues={backlog} onMove={moveIssue} />
          <IssueColumn title="In Progress" status="In Progress" issues={inProgress} onMove={moveIssue} />
          <IssueColumn title="Done" status="Done" issues={done} onMove={moveIssue} />
        </div>
      </DragDropContext>
    </>
  );
};

export default IssueBoard;

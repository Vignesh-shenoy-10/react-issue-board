import React, { useRef, useState } from "react";
import { Issue, IssueStatus } from "../../types";
import IssueColumn from "../IssueColumn/IssueColumn";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { toast, Slide } from "react-toastify";
import "./IssueBoard.css";
import { useIssues } from "../../context/IssuesContext";
import { useUser } from "../../context/UserContext";

const columns: IssueStatus[] = ["Backlog", "In Progress", "Done"];
const normalizeStatus = (status: string) => status.trim().toLowerCase();

type LastAction = {
  issueId: string;
  fromStatus: IssueStatus;
  toStatus: IssueStatus;
  prevIssues: Issue[];
};

const AnimatedEllipsis = () => {
  const [dots, setDots] = React.useState("");
  React.useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length === 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);
  return <span>{dots}</span>;
};

const IssueBoard: React.FC = () => {
  const { issues, setIssues, lastSyncTime, isSyncing } = useIssues();
  const { user } = useUser();
  const role = user?.role ?? "contributor";
  const isAdmin = role === "admin";

  const undoTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<number | null>(null);

  const undoMoveDirect = (prevIssues: Issue[]) => {
    setIssues(JSON.parse(JSON.stringify(prevIssues)));
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
    toast.dismiss();
    toast.info("Issue move undone.", { autoClose: 2000 });
  };

  const triggerUndoToast = (action: LastAction) => {
    toast.dismiss();
    toast(
      ({ closeToast }) => (
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
  };

  const performMove = (updatedIssues: Issue[], action: LastAction) => {
    setIssues(updatedIssues);
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
    undoTimeout.current = setTimeout(() => {}, 5000);
    triggerUndoToast(action);
  };


  const moveIssue = (id: string, direction: "left" | "right") => {
    if (!isAdmin) return;

    setIssues((prev) => {
      const prevSnapshot = JSON.parse(JSON.stringify(prev)) as Issue[];
      const updated = prev.map((i) => ({ ...i }));

      const issueToMove = updated.find((i) => i.id === id);
      if (!issueToMove) return prev;

      const fromStatus = issueToMove.status;
      const currIndex = columns.findIndex(
        (col) => normalizeStatus(col) === normalizeStatus(fromStatus)
      );
      if (currIndex === -1) return prev;

      const newIndex = direction === "left" ? currIndex - 1 : currIndex + 1;
      if (newIndex < 0 || newIndex >= columns.length) return prev;

      const toStatus = columns[newIndex];
      issueToMove.status = toStatus;

      performMove(updated, {
        issueId: id,
        fromStatus,
        toStatus,
        prevIssues: prevSnapshot,
      });
      return updated;
    });
  };

 
  const onDragEnd = (result: DropResult) => {
    if (!isAdmin) return;
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    setIssues((prev) => {
      const prevSnapshot = JSON.parse(JSON.stringify(prev)) as Issue[];

      const fromStatus = source.droppableId as IssueStatus;
      const toStatus = destination.droppableId as IssueStatus;
      const startCol = prev.filter((i) => i.status === fromStatus);
      const finishCol = prev.filter((i) => i.status === toStatus);

      const draggedIdx = startCol.findIndex((i) => i.id === draggableId);
      if (draggedIdx === -1) return prev;

      const draggedIssue = { ...startCol[draggedIdx] };
      startCol.splice(draggedIdx, 1);

      let newIssues: Issue[] = [];

      if (fromStatus === toStatus) {
        startCol.splice(destination.index, 0, draggedIssue);
        for (const issue of prev) {
          if (issue.status === fromStatus) {
            newIssues.push(startCol.shift()!);
          } else {
            newIssues.push(issue);
          }
        }
      } else {
        draggedIssue.status = toStatus;
        finishCol.splice(destination.index, 0, draggedIssue);
        for (const col of columns) {
          newIssues.push(
            ...(col === fromStatus
              ? startCol
              : col === toStatus
              ? finishCol
              : prev.filter((i) => i.status === col))
          );
        }
      }

      performMove(newIssues, {
        issueId: draggedIssue.id,
        fromStatus,
        toStatus,
        prevIssues: prevSnapshot,
      });
      return newIssues;
    });
  };


  const processedIssues = issues.filter((issue) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      issue.title.toLowerCase().includes(q) ||
      (issue.tags || []).some((tag) => tag.toLowerCase().includes(q));
    const matchesAssignee = filterAssignee
      ? issue.assignee === filterAssignee
      : true;
    const matchesSeverity = filterSeverity
      ? issue.severity === filterSeverity
      : true;
    return matchesSearch && matchesAssignee && matchesSeverity;
  });

  const backlog = processedIssues.filter((i) => i.status === "Backlog");
  const inProgress = processedIssues.filter((i) => i.status === "In Progress");
  const done = processedIssues.filter((i) => i.status === "Done");

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: "0.87rem",
          color: isSyncing ? "#276ef1" : "#24b47e",
          gap: 8,
          marginBottom: 10,
          minHeight: 28,
        }}
      >
        {isSyncing ? (
          <>
            <span
              className="live-dot live-anim"
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#276ef1",
                display: "inline-block",
                marginRight: 5,
              }}
            />
            <span>
              Syncing
              <AnimatedEllipsis />
            </span>
          </>
        ) : (
          <>
            <span
              className="live-dot"
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#24b47e",
                display: "inline-block",
                marginRight: 5,
              }}
            />
            <span>
              Last synced:{" "}
              {lastSyncTime ? lastSyncTime.toLocaleTimeString() : "Fetching..."}
            </span>
          </>
        )}
      </div>

      <div className="controls-bar">
        <div className="input-with-icon">
          <span className="input-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by title or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-bar"
          />
        </div>
        <div className="input-with-icon">
          <span className="input-icon">👤</span>
          <select
            className="filter-dropdown"
            value={filterAssignee || ""}
            onChange={(e) => setFilterAssignee(e.target.value || null)}
          >
            <option value="">All Assignees</option>
            {Array.from(new Set(issues.map((i) => i.assignee))).map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="input-with-icon">
          <span className="input-icon">⚡</span>
          <select
            className="filter-dropdown severity-dropdown"
            value={filterSeverity?.toString() || ""}
            onChange={(e) =>
              setFilterSeverity(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">All Severities</option>
            <option value="1">🟢 1 (Low)</option>
            <option value="2">🟡 2 (Medium)</option>
            <option value="3">🔴 3 (High)</option>
          </select>
        </div>
      </div>

      <DragDropContext onDragEnd={isAdmin ? onDragEnd : () => {}}>
        <div className="board">
          <IssueColumn
            title="Backlog"
            status="Backlog"
            issues={backlog}
            onMove={isAdmin ? moveIssue : undefined}
            isDragDisabled={!isAdmin}
          />
          <IssueColumn
            title="In Progress"
            status="In Progress"
            issues={inProgress}
            onMove={isAdmin ? moveIssue : undefined}
            isDragDisabled={!isAdmin}
          />
          <IssueColumn
            title="Done"
            status="Done"
            issues={done}
            onMove={isAdmin ? moveIssue : undefined}
            isDragDisabled={!isAdmin}
          />
        </div>
      </DragDropContext>
    </>
  );
};

export default IssueBoard;

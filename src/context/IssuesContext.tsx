import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { toast, Slide } from "react-toastify";
import rawIssuesData from "../data/issues.json";
import { Issue, IssuePriority, IssueStatus } from "../types";
import { mockFetchIssues } from "../utils/api";

interface IssuesContextType {
  issues: Issue[];
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>;
  updateIssue: (id: string, updatedFields: Partial<Issue>) => void;
  showUndoToast: (message: string, prevIssues: Issue[]) => void;
  recentlyAccessed: string[];
  addToRecentlyAccessed: (issueId: string) => void;
  lastSyncTime: Date | null;
  isSyncing: boolean;
  pollingIntervalMs: number;
  setPollingIntervalMs: (ms: number) => void;
}

const IssuesContext = createContext<IssuesContextType | undefined>(undefined);

export const IssuesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [issues, setIssues] = useState<Issue[]>(() => {
    return rawIssuesData.map((issue) => ({
      ...issue,
      status: issue.status as IssueStatus,
      priority: issue.priority as IssuePriority,
    }));
  });

  const [recentlyAccessed, setRecentlyAccessed] = useState<string[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pollingIntervalMs, setPollingIntervalMs] = useState<number>(10000);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const undoTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("recentlyAccessed");
    if (stored) {
      try {
        setRecentlyAccessed(JSON.parse(stored));
      } catch (err) {
        console.error("Error parsing recentlyAccessed", err);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchAndUpdate = async () => {
      setIsSyncing(true);
      try {
        const data = await mockFetchIssues();
        if (!isMounted) return;
        setIssues(data as Issue[]);
        setLastSyncTime(new Date());
      } catch (err) {
        console.error("Polling fetch failed", err);
      }
      setIsSyncing(false);
    };
    fetchAndUpdate();
    const intervalId = setInterval(fetchAndUpdate, pollingIntervalMs);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [pollingIntervalMs]);

  const updateIssue = (id: string, updatedFields: Partial<Issue>) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === id ? { ...issue, ...updatedFields } : issue
      )
    );
  };

  const undoMoveDirect = (prevIssues: Issue[]) => {
    setIssues(JSON.parse(JSON.stringify(prevIssues)));
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
    toast.dismiss();
    toast.info("Action undone.", { autoClose: 2000 });
  };

  const showUndoToast = (message: string, prevIssues: Issue[]) => {
    toast.dismiss();
    toast(
      ({ closeToast }) => (
        <div className="undo-toast">
          <span className="toast-icon-circle">✔</span>
          <span className="toast-msg">{message}</span>
          <button
            className="undo-btn"
            onClick={() => {
              undoMoveDirect(prevIssues);
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

  const addToRecentlyAccessed = (issueId: string) => {
    setRecentlyAccessed((prev) => {
      const updated = [issueId, ...prev.filter((id) => id !== issueId)].slice(
        0,
        5
      );
      localStorage.setItem("recentlyAccessed", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <IssuesContext.Provider
      value={{
        issues,
        setIssues,
        updateIssue,
        showUndoToast,
        recentlyAccessed,
        addToRecentlyAccessed,
        lastSyncTime,
        isSyncing,
        pollingIntervalMs,
        setPollingIntervalMs,
      }}
    >
      {children}
    </IssuesContext.Provider>
  );
};

export const useIssues = () => {
  const ctx = useContext(IssuesContext);
  if (!ctx) throw new Error("useIssues must be used within IssuesProvider");
  return ctx;
};

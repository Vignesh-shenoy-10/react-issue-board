import React, { createContext, useState, useContext } from "react";
import { Issue } from "../types";
import rawIssuesData from "../data/issues.json";
import { IssuePriority, IssueStatus } from "../types";

interface IssuesContextType {
  issues: Issue[];
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>;
  updateIssue: (id: string, updatedFields: Partial<Issue>) => void;
}

const IssuesContext = createContext<IssuesContextType | undefined>(undefined);

export const IssuesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [issues, setIssues] = useState<Issue[]>(() => {
    return rawIssuesData.map(issue => ({
      ...issue,
      status: issue.status as IssueStatus,
      priority: issue.priority as IssuePriority,
    }));
  });

  const updateIssue = (id: string, updatedFields: Partial<Issue>) => {
    setIssues(prev =>
      prev.map(issue =>
        issue.id === id ? { ...issue, ...updatedFields } : issue
      )
    );
  };

  return (
    <IssuesContext.Provider value={{ issues, setIssues, updateIssue }}>
      {children}
    </IssuesContext.Provider>
  );
};

export const useIssues = (): IssuesContextType => {
  const ctx = useContext(IssuesContext);
  if (!ctx) {
    throw new Error("useIssues must be used within an IssuesProvider");
  }
  return ctx;
};

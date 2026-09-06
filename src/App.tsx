import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ApolloProvider } from "@apollo/client";
import { client } from "./lib/apollo";

import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import ProjectPage from "./pages/ProjectPage";
import ProjectsPage from "./pages/ProjectsPage";
import TaskPage from "./pages/TaskPage";
import TasksPage from "./pages/TasksPage";
import UsersPage from "./pages/UsersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import DocumentPage from "./pages/DocumentPage";
import DocumentEditorPage from "./pages/DocumentEditorPage";

import "./styles/tailwind.css";

const queryClient = new QueryClient();

const appRouter = (
  <AppLayout>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/project/:projectId" element={<ProjectPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/task/:taskId" element={<TaskPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/document/:id" element={<DocumentPage />} />
      <Route path="/document-editor/:id" element={<DocumentEditorPage />} />
    </Routes>
  </AppLayout>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={client}>
        <BrowserRouter>{appRouter}</BrowserRouter>
      </ApolloProvider>
    </QueryClientProvider>
  );
}

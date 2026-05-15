import { Navigate, type RouteObject } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { LoginPage } from "../pages/LoginPage";
import { NotebooksListPage } from "../pages/NotebooksListPage";
import { NotebookEditorPage } from "../pages/NotebookEditorPage";

export const routes: RouteObject[] = [
  { path: "/login", element: <LoginPage /> },
  {
    element: <AppLayout />,
    children: [
      { path: "/notebooks", element: <NotebooksListPage /> },
      { path: "/notebooks/:notebookId", element: <NotebookEditorPage /> }
    ]
  },
  { path: "*", element: <Navigate to="/notebooks" replace /> }
];

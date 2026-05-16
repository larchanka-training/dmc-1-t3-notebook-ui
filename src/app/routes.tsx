import { Navigate, type RouteObject } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { RequireAuth } from "./RequireAuth";
import { LoginPage } from "../pages/LoginPage";
import { NotebooksListPage } from "../pages/NotebooksListPage";
import { NotebookEditorPage } from "../pages/NotebookEditorPage";

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "login", element: <LoginPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: "notebooks", element: <NotebooksListPage /> },
          { path: "notebooks/:notebookId", element: <NotebookEditorPage /> }
        ]
      },
      { path: "*", element: <Navigate to="/login" replace /> }
    ]
  }
];

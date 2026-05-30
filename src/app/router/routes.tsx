import { Navigate, type RouteObject } from "react-router-dom";
import { AppLayout } from "../ui/AppLayout";
import { LoginPage } from "@/pages/login";
import { NotebooksListPage } from "@/pages/notebooks-list";
import { NotebookEditorPage } from "@/pages/notebook-editor";
import { RequireAuth } from "./RequireAuth";

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
          { path: "notebooks/:notebookId", element: <NotebookEditorPage /> },
        ],
      },
      { path: "*", element: <Navigate to="/login" replace /> },
    ],
  },
];

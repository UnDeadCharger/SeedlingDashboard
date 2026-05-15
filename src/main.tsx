import "@/styles/index.css";
import "@/styles/dashboard.css";
import "@/styles/history.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import { routeTree } from "@/routes/routeTree";
import { store } from "@/store";
import { RouterProvider, createRouter } from "@tanstack/react-router";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element with id "root" not found. Check your index.html.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);

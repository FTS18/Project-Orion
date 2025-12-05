import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setupMockFetch } from "./lib/mockData";

// Setup mock fetch for showcasing when backend is unavailable
setupMockFetch();

createRoot(document.getElementById("root")!).render(<App />);

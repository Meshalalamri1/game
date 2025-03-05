import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Game from "@/pages/Game";
import Admin from "@/pages/Admin";
import QuestionPage from "@/pages/QuestionPage"; // Added import for QuestionPage

function AppRouter() { //Renamed to avoid conflict with the main App component.
  return (
    <Routes>
      <Route path="/" element={<Game />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/question/:questionId" element={<QuestionPage />} /> {/* Added route for QuestionPage */}
      <Route path="*" element={<NotFound />} /> {/* Added a catch-all route for 404 */}
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <AppRouter />
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}
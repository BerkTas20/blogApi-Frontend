import { Container } from "@chakra-ui/react";
import { Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import PostsPage from "./pages/PostsPage";
import PostDetailPage from "./pages/PostDetailPage";
import NewPostPage from "./pages/NewPostPage";
import RequireAuth from "./components/RequireAuth";

export default function App() {
  return (
    <>
      <Navbar />

      <Container maxW="6xl" py={6}>
        <Routes>
          <Route path="/" element={<Navigate to="/posts" replace />} />

          {/* ✅ PUBLIC */}
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* ✅ PROTECTED */}
          <Route
            path="/posts/new"
            element={
              <RequireAuth>
                <NewPostPage />
              </RequireAuth>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/posts" replace />} />
        </Routes>
      </Container>
    </>
  );
}

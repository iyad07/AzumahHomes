import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import AboutPage from "./pages/AboutPage";

import ContactPage from "./pages/ContactPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import SubmitBlogPage from "./pages/SubmitBlogPage";
import SubmitListingPage from "./pages/SubmitListingPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFound from "./pages/NotFound";
import ImageUploadDemoPage from "./pages/ImageUploadDemoPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="properties" element={<PropertiesPage />} />
                  <Route path="properties/:id" element={<PropertyDetailPage />} />
                  <Route path="about" element={<AboutPage />} />

                  <Route path="contact" element={<ContactPage />} />
                  <Route path="blog" element={<BlogPage />} />
                  <Route path="blog/:id" element={<BlogDetailPage />} />
                  <Route path="submit-blog" element={
                    <ProtectedRoute requireAdmin={true}>
                      <SubmitBlogPage />
                    </ProtectedRoute>
                  } />
                  <Route path="submit-listing" element={<SubmitListingPage />} />
                  <Route path="image-upload-demo" element={<ImageUploadDemoPage />} />
                  <Route path="dashboard/*" element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
   
  </HelmetProvider>

);

export default App;

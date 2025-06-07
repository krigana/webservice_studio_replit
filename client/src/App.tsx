import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CookieBanner } from "@/components/cookie-banner";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import ProjectsPage from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail";
import ServicesPage from "@/pages/services";
import BlogPage from "@/pages/blog";
import BlogPostPage from "@/pages/blog-post";
import PrivacyPolicy from "@/pages/privacy-policy";
import SitemapPage from "@/pages/sitemap";
import AvatarDemo from "@/pages/avatar-demo";
import NotificationsDemo from "@/pages/notifications-demo";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/project/:id" component={ProjectDetail} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/sitemap" component={SitemapPage} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/avatar" component={AvatarDemo} />
      <Route path="/notifications" component={NotificationsDemo} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <CookieBanner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

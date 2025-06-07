import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { getBlogPostTitle, getBlogPostExcerpt } from "@/lib/blog-utils";
import type { BlogPost } from "@shared/schema";

export default function BlogSection() {
  const { t, language } = useTranslation();

  const { data: blogPosts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
    staleTime: 0, // Данные считаются устаревшими сразу
    refetchOnWindowFocus: true, // Обновлять при фокусе окна
    refetchOnMount: true, // Обновлять при монтировании
    refetchInterval: 2000, // Обновлять каждые 2 секунды
  });

  // Show only 3 most recent posts
  const recentPosts = Array.isArray(blogPosts) ? blogPosts.slice(0, 3) : [];

  if (isLoading) {
    return (
      <section id="blog" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">{t('blogSectionTitle')}</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">{t('blogSectionSubtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="aspect-video bg-slate-200"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">{t('blogSectionTitle')}</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">{t('blogSectionSubtitle')}</p>
        </div>
        
        {recentPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {recentPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="block">
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 shadow-lg flex flex-col cursor-pointer">
                  <div className="aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                    {post.imageUrl ? (
                      <img 
                        src={post.imageUrl} 
                        alt={getBlogPostTitle(post, language)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <User className="h-12 w-12 text-primary/40" />
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-sm text-slate-500 mb-3">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-slate-800 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {getBlogPostTitle(post, language)}
                    </h3>
                    
                    <p className="text-slate-600 mb-4 line-clamp-3 flex-grow">
                      {getBlogPostExcerpt(post, language)}
                    </p>
                    
                    <div className="mt-auto">
                      <Button 
                        variant="outline" 
                        className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300"
                      >
                        {t('readMoreBlog')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">{t('noBlogPosts')}</p>
          </div>
        )}
        
        {recentPosts.length > 0 && (
          <div className="text-center">
            <Link href="/blog">
              <Button 
                size="lg"
                className="bg-orange text-white hover:bg-purple transition-all duration-200 transform hover:scale-105"
              >
                {t('viewAllBlogPosts')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
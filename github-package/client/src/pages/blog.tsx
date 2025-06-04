import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link } from "wouter";
import { BlogPost } from "@shared/schema";
import { useTranslation } from "@/lib/i18n";
import { getBlogPostTitle, getBlogPostExcerpt, getBlogPostContent, formatDate, getReadingTime } from "@/lib/blog-utils";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, ArrowLeft } from "lucide-react";

export default function BlogPage() {
  const { t, language } = useTranslation();

  const { data: blogPosts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  // Прокрутка в начало страницы при загрузке
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-6 py-20">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-slate-600">{t('loading')}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const publishedPosts = blogPosts.filter(post => post.isPublished);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-20">
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="mb-8">
              <Link href="/">
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('backToMain')}
                </Button>
              </Link>
            </div>
            <div className="text-center mb-16">
              <h1 className="text-4xl font-bold text-secondary mb-4">{t('allBlogTitle')}</h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                {t('allBlogDescription')}
              </p>
            </div>

            {publishedPosts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-slate-600 mb-8">{t('noArticlesAvailable')}</p>
                <Link href="/">
                  <Button 
                    size="lg"
                    className="bg-orange text-white hover:bg-purple transition-all duration-200"
                  >
                    ← 
                    {t('backToMain')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {publishedPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col"
                  >
                    {post.imageUrl && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.imageUrl}
                          alt={getBlogPostTitle(post, language)}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{getReadingTime(getBlogPostContent(post, language), language)}</span>
                        </div>
                      </div>

                      <h2 className="text-xl font-semibold text-secondary mb-3 line-clamp-2">
                        {getBlogPostTitle(post, language)}
                      </h2>
                      
                      <p className="text-slate-600 mb-4 line-clamp-3 flex-grow">
                        {getBlogPostExcerpt(post, language)}
                      </p>

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <Link href={`/blog/${post.slug}`} className="mt-auto">
                        <Button variant="outline" className="w-full group">
                          {t('readMore')}
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Link href="/">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-orange text-orange hover:bg-orange hover:text-white transition-all duration-200"
                >
                  ← 
                  {t('backToMain')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
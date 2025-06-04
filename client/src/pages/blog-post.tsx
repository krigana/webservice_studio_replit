import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { BlogPost } from "@shared/schema";
import { useTranslation } from "@/lib/i18n";
import { getBlogPostTitle, getBlogPostExcerpt, getBlogPostContent, formatDate, getReadingTime } from "@/lib/blog-utils";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowLeft, ArrowRight, Share2, Copy, Check } from "lucide-react";
import { SiFacebook, SiX, SiTelegram, SiLinkedin, SiWhatsapp } from "react-icons/si";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useTranslation();
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Прокрутка в начало страницы при загрузке
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Закрытие меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isShareMenuOpen && !(event.target as Element).closest('.share-menu')) {
        setIsShareMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isShareMenuOpen]);

  const { data: blogPost, isLoading } = useQuery<BlogPost>({
    queryKey: ["/api/blog", slug],
    queryFn: () => fetch(`/api/blog/${slug}`).then(res => res.json()),
    staleTime: 10 * 60 * 1000, // 10 минут
    gcTime: 30 * 60 * 1000, // 30 минут
  });

  const { data: allPosts = [] } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 15 * 60 * 1000, // 15 минут
  });

  // Функции для социальных сетей
  const getArticleUrl = () => {
    return window.location.href;
  };

  const getArticleTitle = () => {
    return blogPost ? getBlogPostTitle(blogPost, language) : '';
  };

  const getArticleDescription = () => {
    return blogPost ? getBlogPostExcerpt(blogPost, language) : '';
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getArticleUrl())}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const text = `${getArticleTitle()} - ${getArticleDescription()}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getArticleUrl())}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getArticleUrl())}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTelegram = () => {
    const text = `${getArticleTitle()}\n${getArticleDescription()}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(getArticleUrl())}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    const text = `${getArticleTitle()}\n${getArticleDescription()}\n${getArticleUrl()}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getArticleUrl());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

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

  if (!blogPost) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-6 py-20 text-center">
            <h1 className="text-2xl font-bold text-secondary mb-4">{t('articleNotFound')}</h1>
            <p className="text-slate-600 mb-8">{t('articleNotFoundDescription')}</p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('backToBlog')}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedPosts = allPosts
    .filter(post => post.id !== blogPost.id && post.isPublished)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-20">
        {/* Article Header */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link href="/blog">
                  <Button 
                    variant="outline" 
                    className="border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('backToBlog')}
                  </Button>
                </Link>
                <Link href="/">
                  <Button 
                    variant="outline" 
                    className="border-orange text-orange hover:bg-orange hover:text-white transition-all duration-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('backToHome')}
                  </Button>
                </Link>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
                {getBlogPostTitle(blogPost, language)}
              </h1>

              <p className="text-xl text-slate-600 mb-8">
                {getBlogPostExcerpt(blogPost, language)}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{t('publishedOn')} {formatDate(new Date(blogPost.publishedAt || blogPost.createdAt), language)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{getReadingTime(getBlogPostContent(blogPost, language), language)}</span>
                </div>
                <div className="relative ml-auto share-menu">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                    className="relative"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    {t('share')}
                  </Button>
                  
                  {isShareMenuOpen && (
                    <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-slate-200 p-4 z-10 min-w-[250px]">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">{t('shareArticle')}</h4>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={shareToFacebook}
                          className="flex items-center justify-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <SiFacebook className="w-4 h-4" />
                          Facebook
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={shareToTwitter}
                          className="flex items-center justify-center gap-2 text-black border-slate-200 hover:bg-slate-50"
                        >
                          <SiX className="w-4 h-4" />
                          X
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={shareToLinkedIn}
                          className="flex items-center justify-center gap-2 text-blue-700 border-blue-200 hover:bg-blue-50"
                        >
                          <SiLinkedin className="w-4 h-4" />
                          LinkedIn
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={shareToTelegram}
                          className="flex items-center justify-center gap-2 text-blue-500 border-blue-200 hover:bg-blue-50"
                        >
                          <SiTelegram className="w-4 h-4" />
                          Telegram
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={shareToWhatsApp}
                          className="flex items-center justify-center gap-2 text-green-600 border-green-200 hover:bg-green-50 col-span-2"
                        >
                          <SiWhatsapp className="w-4 h-4" />
                          WhatsApp
                        </Button>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        className="w-full flex items-center justify-center gap-2 text-slate-600 border-slate-200 hover:bg-slate-50 mb-2"
                      >
                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {isCopied ? t('copied') : t('copyLink')}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsShareMenuOpen(false)}
                        className="w-full mt-2 text-slate-500"
                      >
                        {t('close')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {blogPost.tags && blogPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  <span className="text-sm text-slate-500 mr-2">{t('articleTags')}:</span>
                  {blogPost.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Featured Image */}
        {blogPost.imageUrl && (
          <section className="py-8">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto">
                <img
                  src={blogPost.imageUrl}
                  alt={getBlogPostTitle(blogPost, language)}
                  className="w-full rounded-lg shadow-sm"
                />
              </div>
            </div>
          </section>
        )}

        {/* Article Content */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-slate-700 leading-relaxed blog-content"
                  dangerouslySetInnerHTML={{ __html: getBlogPostContent(blogPost, language) }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="py-16 bg-slate-50">
            <div className="container mx-auto px-6">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-secondary mb-12 text-center">
                  {t('relatedArticles')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {relatedPosts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
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
                      
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-secondary mb-2 line-clamp-2">
                          {getBlogPostTitle(post, language)}
                        </h3>
                        
                        <p className="text-slate-600 mb-4 line-clamp-2">
                          {getBlogPostExcerpt(post, language)}
                        </p>

                        <Link href={`/blog/${post.slug}`}>
                          <Button variant="outline" size="sm">
                            {t('readMore')}
                          </Button>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* View All Articles Button */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <Link href="/blog">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-orange text-orange hover:bg-orange hover:text-white transition-all duration-200"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  {t('viewAllArticles')}
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
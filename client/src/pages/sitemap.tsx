import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n";
import { ChevronRight, ChevronDown, Globe, FileText, Users, Settings, Home, Briefcase } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import type { Project, BlogPost, Service } from "@shared/schema";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface SitemapNode {
  title: string;
  url: string;
  children?: SitemapNode[];
  icon?: any;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

export default function SitemapPage() {
  const { t, language } = useTranslation();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['main', 'content']));

  // Load data for sitemap
  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
  }) as { data: Project[] | undefined };

  const { data: blogPosts } = useQuery({
    queryKey: ["/api/blog"],
  }) as { data: BlogPost[] | undefined };

  const { data: services } = useQuery({
    queryKey: ["/api/services"],
  }) as { data: Service[] | undefined };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Build sitemap structure
  const sitemapData: SitemapNode[] = [
    {
      title: t('home') || "Главная",
      url: "/",
      icon: Home,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: "weekly",
      priority: "1.0"
    },
    {
      title: t('about') || "О нас",
      url: "/#about",
      icon: Users,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: "monthly",
      priority: "0.8"
    },
    {
      title: t('services') || "Услуги",
      url: "/services",
      icon: Briefcase,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: "weekly",
      priority: "0.9",
      children: services?.filter(service => service.isVisible).map(service => ({
        title: getLocalizedTitle(service, language),
        url: `/services#service-${service.id}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: "monthly",
        priority: "0.7"
      })) || []
    },
    {
      title: t('portfolio') || "Портфолио",
      url: "/projects",
      icon: Briefcase,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: "weekly",
      priority: "0.9",
      children: projects?.filter(project => project.isVisible).map(project => ({
        title: getLocalizedTitle(project, language),
        url: `/projects/${project.id}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: "monthly",
        priority: "0.6"
      })) || []
    },
    {
      title: t('blog') || "Блог",
      url: "/blog",
      icon: FileText,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: "daily",
      priority: "0.8",
      children: blogPosts?.map(post => ({
        title: getLocalizedTitle(post, language),
        url: `/blog/${post.slug}`,
        lastmod: post.updatedAt ? new Date(post.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        changefreq: "monthly",
        priority: "0.6"
      })) || []
    },
    {
      title: t('contact') || "Контакты",
      url: "/#contact",
      icon: Users,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: "monthly",
      priority: "0.7"
    },
    {
      title: t('privacyPolicy') || "Политика конфиденциальности",
      url: "/privacy-policy",
      icon: FileText,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: "yearly",
      priority: "0.3"
    }
  ];

  function getLocalizedTitle(item: any, language: string): string {
    if (language === 'uk' && item.titleUk) return item.titleUk;
    if (language === 'ru' && item.titleRu) return item.titleRu;
    if (language === 'en' && item.titleEn) return item.titleEn;
    return item.title;
  }

  const SitemapNode = ({ node, level = 0, nodeId }: { node: SitemapNode; level?: number; nodeId: string }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(nodeId);
    const Icon = node.icon || Globe;

    return (
      <div className="select-none">
        <div 
          className={`flex items-center py-2 px-3 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${level === 0 ? 'font-semibold' : ''}`}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => hasChildren && toggleNode(nodeId)}
        >
          {hasChildren && (
            <div className="mr-2 w-4 h-4 flex items-center justify-center">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          )}
          {!hasChildren && <div className="mr-2 w-4 h-4" />}
          
          <Icon size={16} className="mr-2 text-primary" />
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className={`${level === 0 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                {node.title}
              </span>
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                {node.priority && (
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    {node.priority}
                  </span>
                )}
                {node.changefreq && (
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    {node.changefreq}
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              <a 
                href={node.url} 
                className="hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {window.location.origin}{node.url}
              </a>
              {node.lastmod && (
                <span className="ml-2">• {t('lastModified') || 'Обновлено'}: {node.lastmod}</span>
              )}
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {node.children!.map((child, index) => (
              <SitemapNode 
                key={`${nodeId}-${index}`}
                node={child} 
                level={level + 1}
                nodeId={`${nodeId}-${index}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              {t('sitemap') || 'Карта сайта'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {t('sitemapDescription') || 'Структура всех страниц сайта для удобной навигации и поиска нужной информации'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Link to="/" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              <Home size={16} className="mr-2" />
              {t('backToHome') || 'На главную'}
            </Link>
            <a 
              href="/sitemap.xml" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              <FileText size={16} className="mr-2" />
              XML Sitemap
            </a>
            <button
              onClick={() => {
                const allNodeIds = new Set<string>();
                const collectNodeIds = (nodes: SitemapNode[], prefix = 'main-') => {
                  nodes.forEach((node, index) => {
                    const nodeId = `${prefix}${index}`;
                    allNodeIds.add(nodeId);
                    if (node.children) {
                      collectNodeIds(node.children, `${nodeId}-`);
                    }
                  });
                };
                collectNodeIds(sitemapData);
                setExpandedNodes(allNodeIds);
              }}
              className="inline-flex items-center px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              <ChevronDown size={16} className="mr-2" />
              {t('expandAll') || 'Развернуть все'}
            </button>
            <button
              onClick={() => setExpandedNodes(new Set())}
              className="inline-flex items-center px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              <ChevronRight size={16} className="mr-2" />
              {t('collapseAll') || 'Свернуть все'}
            </button>
          </div>

          {/* Sitemap Tree */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6">
            <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                <Globe size={20} className="mr-2 text-primary" />
                {t('siteStructure') || 'Структура сайта'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {t('siteStructureDescription') || 'Нажмите на элементы со стрелками для разворачивания разделов'}
              </p>
            </div>
            
            <div className="space-y-1">
              {sitemapData.map((node, index) => (
                <SitemapNode 
                  key={index}
                  node={node} 
                  nodeId={`main-${index}`}
                />
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 text-center shadow">
              <div className="text-2xl font-bold text-primary">{sitemapData.length}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{t('mainSections') || 'Основных разделов'}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 text-center shadow">
              <div className="text-2xl font-bold text-primary">{projects?.filter(p => p.isVisible).length || 0}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{t('projects') || 'Проектов'}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 text-center shadow">
              <div className="text-2xl font-bold text-primary">{blogPosts?.length || 0}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{t('blogPosts') || 'Статей'}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 text-center shadow">
              <div className="text-2xl font-bold text-primary">{services?.filter(s => s.isVisible).length || 0}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{t('services') || 'Услуг'}</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
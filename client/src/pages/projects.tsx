import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, ExternalLink } from "lucide-react";
import { useTranslation, useLanguage, translations } from "@/lib/i18n";
import { getProjectTitle, getProjectDescription } from "@/lib/project-utils";
import { Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import type { Project } from "@shared/schema";

export default function ProjectsPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
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
          <section className="py-20 bg-slate-50">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h1 className="text-4xl font-bold text-secondary mb-4">Все проекты</h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Загрузка проектов...
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-slate-200 animate-pulse rounded-2xl h-80"></div>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

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
              <h1 className="text-4xl font-bold text-secondary mb-4">{t('allProjectsTitle')}</h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                {t('allProjectsDescription')}
              </p>
            </div>
            
            {projects.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-slate-600 mb-8">{t('noProjectsYet')}</p>
                <Link href="/">
                  <Button 
                    size="lg"
                    className="bg-orange text-white hover:bg-purple transition-all duration-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('backToMain')}
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {projects.sort((a, b) => a.order - b.order).map((project) => (
                    <div 
                      key={project.id}
                      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full"
                    >
                      <img 
                        src={project.imageUrl} 
                        alt={project.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="p-6 flex-grow flex flex-col">
                        <h3 className="text-xl font-semibold text-secondary mb-2">
                          {getProjectTitle(project, language)}
                        </h3>
                        <p className="text-slate-600 mb-4">
                          {getProjectDescription(project, language)}
                        </p>
                        <div className="flex gap-px mb-4 flex-grow overflow-x-auto scrollbar-hide justify-start -ml-1">
                          {project.technologies.map((tech, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary"
                              className={`text-xs hover:bg-opacity-100 ${
                                index % 3 === 0 ? 'bg-orange/10 text-orange hover:bg-orange/10' :
                                index % 3 === 1 ? 'bg-purple/10 text-purple hover:bg-purple/10' :
                                'bg-coral/10 text-coral hover:bg-coral/10'
                              }`}
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex justify-between items-center mt-auto">
                          <Link href={`/project/${project.id}`}>
                            <button className="text-primary font-semibold hover:text-orange transition-colors duration-200 flex items-center">
                              {t('viewDetails')} <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                          </Link>
                          {project.projectUrl && (
                            <a 
                              href={project.projectUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-gray-500 hover:text-primary transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <Link href="/">
                    <Button 
                      size="lg"
                      variant="outline"
                      className="border-orange text-orange hover:bg-orange hover:text-white transition-all duration-200"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t('backToMain')}
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
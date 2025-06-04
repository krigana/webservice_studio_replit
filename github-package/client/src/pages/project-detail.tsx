import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Calendar, ExternalLink, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ProjectDiscussionModal } from "@/components/project-discussion-modal";
import { useTranslation, useLanguage } from "@/lib/i18n";
import { getProjectTitle, getProjectDescription } from "@/lib/project-utils";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Прокрутка в начало страницы при загрузке
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch all projects and find the one with matching ID
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"]
  });

  const project = projects?.find(p => p.id === Number(id));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-6 py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded mb-4"></div>
              <div className="h-4 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 bg-slate-200 rounded mb-8"></div>
              <div className="h-64 bg-slate-200 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-6 py-12 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">{t('projectNotFound')}</h1>
            <p className="text-slate-600 mb-8">{t('projectNotFoundDescription')}</p>
            <Link href="/projects">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('backToProjects')}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get translated title and description
  const translatedTitle = getProjectTitle(project, language);
  const translatedDescription = getProjectDescription(project, language);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-6 py-12">
          {/* Back button */}
          <Link href="/projects">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToProjects')}
            </Button>
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Project Image */}
            <div className="space-y-4">
              <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                {project.imageUrl ? (
                  <img 
                    src={project.imageUrl} 
                    alt={translatedTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-slate-200 rounded-lg flex items-center justify-center">
                        <Tag className="w-8 h-8" />
                      </div>
                      <p>{t('noImage')}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">{t('technologies')}</h3>
                  <div className="flex gap-px overflow-x-auto scrollbar-hide justify-start -ml-1">
                    {project.technologies.map((tech, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className={`hover:bg-opacity-100 ${
                          index % 3 === 0 ? 'bg-orange/10 text-orange hover:bg-orange/10' :
                          index % 3 === 1 ? 'bg-purple/10 text-purple hover:bg-purple/10' :
                          'bg-coral/10 text-coral hover:bg-coral/10'
                        }`}
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Project Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">
                  {translatedTitle}
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed">
                  {translatedDescription}
                </p>
              </div>

              {/* Project Meta */}
              <div className="space-y-4">

                {project.projectUrl && (
                  <div className="flex items-center">
                    <ExternalLink className="w-5 h-5 mr-3 text-slate-600" />
                    <a 
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      {t('viewProject')}
                    </a>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-slate-700">{t('status')}:</span>
                <Badge variant={project.isVisible ? "default" : "secondary"}>
                  {project.isVisible ? t('published') : t('draft')}
                </Badge>
              </div>

              {/* Call to Action */}
              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-orange text-white hover:bg-purple transition-all duration-200"
                  onClick={() => setIsProjectModalOpen(true)}
                >
                  {t('startSimilarProject')}
                </Button>
                <Link href="/projects">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-orange text-orange hover:bg-orange hover:text-white transition-all duration-200"
                  >
                    {t('backToProjects')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Project Discussion Modal */}
      <ProjectDiscussionModal 
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </div>
  );
}
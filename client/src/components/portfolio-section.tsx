import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useTranslation, useLanguage, translations } from "@/lib/i18n";
import { getProjectTitle, getProjectDescription } from "@/lib/project-utils";
import { Link } from "wouter";
import type { Project } from "@shared/schema";

export default function PortfolioSection() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  if (isLoading) {
    return (
      <section id="portfolio" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary mb-4">{t('portfolioTitle')}</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('portfolioDescription')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-200 animate-pulse rounded-2xl h-80"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-secondary mb-4">{t('portfolioTitle')}</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {t('portfolioDescription')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {projects.sort((a, b) => a.order - b.order).slice(0, 3).map((project, index) => {
            // Use project data with translation support from database
            const projectTitle = getProjectTitle(project, language);
            const projectDescription = getProjectDescription(project, language);
            
            return (
              <div 
                key={project.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full"
              >
                <img 
                  src={project.imageUrl} 
                  alt={projectTitle}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-semibold text-secondary mb-2">{projectTitle}</h3>
                  <p className="text-slate-600 mb-4">{projectDescription}</p>
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
                  <div className="mt-auto">
                    <Link href={`/project/${project.id}`}>
                      <button className="text-primary font-semibold hover:text-orange transition-colors duration-200 flex items-center">
                        {t('viewDetails')} <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link href="/projects">
            <Button 
              size="lg"
              className="bg-orange text-white hover:bg-purple transition-all duration-200 transform hover:scale-105"
            >
              {t('viewAllProjects')}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

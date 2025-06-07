import type { Project, Service } from "@shared/schema";
import type { Language } from "./i18n";

export function getProjectTitle(project: Project, language: Language): string {
  switch (language) {
    case 'uk':
      return project.titleUk || project.title;
    case 'ru':
      return project.titleRu || project.title;
    case 'en':
      return project.titleEn || project.title;
    default:
      return project.title;
  }
}

export function getProjectDescription(project: Project, language: Language): string {
  switch (language) {
    case 'uk':
      return project.descriptionUk || project.description;
    case 'ru':
      return project.descriptionRu || project.description;
    case 'en':
      return project.descriptionEn || project.description;
    default:
      return project.description;
  }
}

export function getServiceTitle(service: Service, language: Language): string {
  switch (language) {
    case 'uk':
      return service.titleUk || service.title;
    case 'ru':
      return service.titleRu || service.title;
    case 'en':
      return service.titleEn || service.title;
    default:
      return service.title;
  }
}

export function getServiceDescription(service: Service, language: Language): string {
  switch (language) {
    case 'uk':
      return service.descriptionUk || service.description;
    case 'ru':
      return service.descriptionRu || service.description;
    case 'en':
      return service.descriptionEn || service.description;
    default:
      return service.description;
  }
}

export function getServiceFeatures(service: Service, language: Language): string[] {
  switch (language) {
    case 'uk':
      return service.featuresUk || service.features;
    case 'ru':
      return service.featuresRu || service.features;
    case 'en':
      return service.featuresEn || service.features;
    default:
      return service.features;
  }
}
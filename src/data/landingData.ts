import type { Feature, Benefit } from '../types/landing';

export const features: Feature[] = [
  {
    id: 'visualization',
    icon: 'visualization',
    title: '2D/3D Visualization',
    description: 'Switch seamlessly between 2D floor plans and immersive 3D views to see your design from every angle',
    order: 1,
  },
  {
    id: 'library',
    icon: 'library',
    title: 'Furniture Library',
    description: 'Access a comprehensive library of furniture pieces with accurate dimensions and realistic representations',
    order: 2,
  },
  {
    id: 'save-load',
    icon: 'save-load',
    title: 'Save & Load Designs',
    description: 'Cloud storage for all your designs with automatic syncing, accessible from anywhere, anytime',
    order: 3,
  },
  {
    id: 'real-time',
    icon: 'real-time',
    title: 'Real-time Editing',
    description: 'Instant updates as you drag, resize, and rotate furniture with smooth, responsive interactions',
    order: 4,
  },
];

export const benefits: Benefit[] = [
  {
    id: 'time-saving',
    icon: 'time-saving',
    title: 'Save Time',
    description: 'Plan your perfect space in minutes instead of hours with intuitive drag-and-drop tools',
    order: 1,
  },
  {
    id: 'cost-effective',
    icon: 'cost-effective',
    title: 'Cost Effective',
    description: 'Avoid expensive mistakes by visualizing furniture placement before making any purchases',
    order: 2,
  },
  {
    id: 'professional',
    icon: 'professional',
    title: 'Professional Results',
    description: 'Create stunning designs that look like they came from a professional interior designer',
    order: 3,
  },
];

export function validateFeature(feature: Feature): boolean {
  return !!(
    feature.id &&
    feature.icon &&
    feature.title &&
    feature.description &&
    typeof feature.order === 'number'
  );
}

export function validateBenefit(benefit: Benefit): boolean {
  return !!(
    benefit.id &&
    benefit.icon &&
    benefit.title &&
    benefit.description &&
    typeof benefit.order === 'number'
  );
}

if (process.env.NODE_ENV === 'development') {
  features.forEach((feature) => {
    if (!validateFeature(feature)) {
      console.error('Invalid feature data:', feature);
    }
  });

  benefits.forEach((benefit) => {
    if (!validateBenefit(benefit)) {
      console.error('Invalid benefit data:', benefit);
    }
  });
}

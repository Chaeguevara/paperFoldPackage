import { Link } from 'react-router-dom';
import type { Template, ShapeType } from '@/types';

interface TemplateWithShape extends Template {
  defaultConfig: {
    shapeType: ShapeType;
    width: number;
    height: number;
    depth: number;
    thickness: number;
  };
}

export const templates: TemplateWithShape[] = [
  {
    id: 'box-simple',
    name: 'Simple Box',
    description: 'Basic rectangular box with lid',
    thumbnail: '/templates/box-simple.svg',
    category: 'box',
    defaultConfig: { shapeType: 'box', width: 5, height: 3, depth: 5, thickness: 0.5 },
  },
  {
    id: 'pyramid',
    name: 'Pyramid',
    description: 'Four-sided pyramid shape',
    thumbnail: '/templates/pyramid.svg',
    category: 'box',
    defaultConfig: { shapeType: 'pyramid', width: 6, height: 5, depth: 6, thickness: 0.5 },
  },
  {
    id: 'hexagonal-prism',
    name: 'Hexagonal Prism',
    description: 'Six-sided prism container',
    thumbnail: '/templates/prism.svg',
    category: 'box',
    defaultConfig: { shapeType: 'prism', width: 4, height: 6, depth: 4, thickness: 0.5 },
  },
  {
    id: 'cylinder',
    name: 'Cylinder',
    description: 'Round cylindrical container',
    thumbnail: '/templates/cylinder.svg',
    category: 'box',
    defaultConfig: { shapeType: 'cylinder', width: 5, height: 7, depth: 5, thickness: 0.5 },
  },
  {
    id: 'envelope-basic',
    name: 'Envelope',
    description: 'Standard envelope pattern',
    thumbnail: '/templates/envelope.svg',
    category: 'envelope',
    defaultConfig: { shapeType: 'envelope', width: 16, height: 11, depth: 8, thickness: 0.3 },
  },
];

const SHAPE_COLORS: Record<ShapeType, string> = {
  box: '#4F46E5',
  pyramid: '#10B981',
  cylinder: '#F59E0B',
  prism: '#EC4899',
  envelope: '#8B5CF6',
};

const SHAPE_ICONS: Record<ShapeType, string> = {
  box: '▭',
  pyramid: '△',
  cylinder: '○',
  prism: '⬡',
  envelope: '✉',
};

export function Templates() {
  return (
    <div className="templates">
      <h1>Templates</h1>
      <p>Choose a template to get started, then customize in the editor.</p>

      <div className="template-grid">
        {templates.map((template) => (
          <Link
            key={template.id}
            to={`/editor?template=${template.id}`}
            className="template-card"
          >
            <div className="template-thumbnail">
              <div
                className="template-placeholder"
                style={{ backgroundColor: SHAPE_COLORS[template.defaultConfig.shapeType] }}
              >
                {SHAPE_ICONS[template.defaultConfig.shapeType]}
              </div>
            </div>
            <div className="template-info">
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              <span className="template-category">{template.category}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

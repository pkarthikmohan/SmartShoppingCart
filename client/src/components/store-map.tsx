import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STORE_SECTIONS, SAMPLE_STOCK_IMAGES } from '@/lib/constants';
import { MapPin, Navigation } from 'lucide-react';

interface StoreMapProps {
  currentSection: string;
  onSectionClick: (sectionId: string) => void;
  navigationInstructions?: {
    distance: number;
    direction: string;
    estimatedTime: number;
    currentSection: any;
    targetSection: any;
  } | null;
}

export default function StoreMap({ currentSection, onSectionClick, navigationInstructions }: StoreMapProps) {
  const sectionKeys = Object.keys(STORE_SECTIONS) as Array<keyof typeof STORE_SECTIONS>;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Store Map</h2>
        <Badge variant="outline" className="text-secondary">
          <MapPin className="w-3 h-3 mr-1" />
          Li-Fi Tracking Active
        </Badge>
      </div>
      
      {/* Interactive Store Layout */}
      <div className="relative bg-gray-100 rounded-xl p-4 h-80 mb-4">
        <div className="grid grid-cols-3 gap-2 h-full">
          {sectionKeys.map((sectionId, index) => {
            const section = STORE_SECTIONS[sectionId];
            const isCurrentSection = currentSection === sectionId;
            const imageUrl = SAMPLE_STOCK_IMAGES[sectionId as keyof typeof SAMPLE_STOCK_IMAGES];
            
            return (
              <div
                key={sectionId}
                className={`
                  ${section.color} rounded-lg p-3 cursor-pointer transition-all duration-200 
                  ${isCurrentSection ? 'ring-4 ring-primary ring-opacity-75 scale-105' : ''}
                  hover:scale-102 touch-feedback
                `}
                onClick={() => onSectionClick(sectionId)}
              >
                <img 
                  src={imageUrl} 
                  alt={section.name} 
                  className="w-full h-16 object-cover rounded mb-2" 
                />
                <p className="text-xs font-medium text-center">{section.name}</p>
                <p className="text-xs text-center text-gray-600 font-devanagari">{section.nameHindi}</p>
                
                {isCurrentSection && (
                  <div className="absolute -top-2 -right-2 bg-primary p-1 rounded-full animate-pulse">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Your Location Indicator */}
        <div className="absolute top-20 left-16 bg-primary p-2 rounded-full animate-pulse-slow">
          <MapPin className="w-4 h-4 text-white" />
        </div>
        
        {/* Path Guidance */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path 
            d="M 60 80 Q 100 120 140 160" 
            stroke="hsl(17, 88%, 59%)" 
            strokeWidth="3" 
            fill="none" 
            strokeDasharray="5,5" 
            opacity="0.7"
            className="animate-pulse"
          />
        </svg>
      </div>
      
      {/* Navigation Instructions */}
      {navigationInstructions && (
        <div className="p-3 bg-primary bg-opacity-10 rounded-lg border border-primary border-opacity-20">
          <div className="flex items-center mb-2">
            <Navigation className="w-4 h-4 text-primary mr-2" />
            <p className="text-sm font-medium text-primary">Navigation</p>
          </div>
          <p className="text-sm text-gray-700">
            Current: {navigationInstructions.currentSection.name}
          </p>
          <p className="text-sm text-gray-700">
            To {navigationInstructions.targetSection.name}: {navigationInstructions.distance}m {navigationInstructions.direction}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Estimated time: {navigationInstructions.estimatedTime} seconds
          </p>
        </div>
      )}
      
      {/* Section Status */}
      <div className="mt-4 space-y-2">
        <h4 className="font-medium text-gray-700 text-sm">Section Status</h4>
        <div className="grid grid-cols-2 gap-2">
          {sectionKeys.slice(0, 4).map((sectionId) => {
            const section = STORE_SECTIONS[sectionId];
            const isCurrentSection = currentSection === sectionId;
            
            return (
              <div key={sectionId} className="flex items-center justify-between text-xs">
                <span className={isCurrentSection ? 'font-bold text-primary' : 'text-gray-600'}>
                  {section.name}
                </span>
                <Badge 
                  variant={isCurrentSection ? "default" : "outline"} 
                  className="h-5 text-xs"
                >
                  {isCurrentSection ? 'Current' : 'Available'}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

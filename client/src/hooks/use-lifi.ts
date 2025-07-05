import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { STORE_SECTIONS } from '@/lib/constants';

interface LiFiPosition {
  section: string;
  x: number;
  y: number;
  timestamp: Date;
}

interface StoreLayout {
  sections: Array<{
    id: string;
    name: string;
    nameHindi: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
  }>;
  lifiZones: Array<{
    section: string;
    x: number;
    y: number;
    range: number;
  }>;
}

interface UseLiFiOptions {
  sessionId: string;
  storeId?: number;
  onPositionChange?: (position: LiFiPosition) => void;
}

export function useLiFi({ sessionId, storeId = 1, onPositionChange }: UseLiFiOptions) {
  const [currentPosition, setCurrentPosition] = useState<LiFiPosition | null>(null);
  const [currentSection, setCurrentSection] = useState<string>('produce');
  const [isTracking, setIsTracking] = useState(true);
  const [signal] = useState({ strength: 85, quality: 'Excellent' });

  // Fetch store layout
  const { data: storeLayout } = useQuery<StoreLayout>({
    queryKey: ['/api/store', storeId, 'layout'],
  });

  // Fetch current position
  const { data: lastPosition } = useQuery<LiFiPosition>({
    queryKey: ['/api/position', sessionId],
    enabled: !!sessionId,
    refetchInterval: 2000, // Update position every 2 seconds
  });

  // Simulate Li-Fi positioning based on store layout
  const simulatePositioning = useCallback(() => {
    if (!storeLayout) return;

    // Simulate movement through store sections
    const sections = Object.keys(STORE_SECTIONS);
    const currentIndex = sections.indexOf(currentSection);
    
    // Simulate gradual movement through sections
    const section = storeLayout.sections.find(s => s.id === currentSection);
    if (section) {
      const baseX = section.x + section.width / 2;
      const baseY = section.y + section.height / 2;
      
      // Add some random movement within the section
      const x = baseX + (Math.random() - 0.5) * section.width * 0.5;
      const y = baseY + (Math.random() - 0.5) * section.height * 0.5;
      
      const newPosition: LiFiPosition = {
        section: currentSection,
        x: parseFloat(x.toFixed(2)),
        y: parseFloat(y.toFixed(2)),
        timestamp: new Date()
      };
      
      setCurrentPosition(newPosition);
      onPositionChange?.(newPosition);
    }
  }, [currentSection, storeLayout, onPositionChange]);

  // Auto-advance through sections for demonstration
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      const sections = Object.keys(STORE_SECTIONS);
      const currentIndex = sections.indexOf(currentSection);
      const nextIndex = (currentIndex + 1) % sections.length;
      
      // Change section every 15 seconds for demo
      if (Math.random() < 0.1) { // 10% chance per update
        setCurrentSection(sections[nextIndex]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentSection, isTracking]);

  // Update positioning simulation
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(simulatePositioning, 2000);
    return () => clearInterval(interval);
  }, [simulatePositioning, isTracking]);

  // Navigation helper
  const navigateToSection = useCallback((sectionId: string) => {
    if (sectionId in STORE_SECTIONS) {
      setCurrentSection(sectionId);
    }
  }, []);

  // Get navigation instructions
  const getNavigationInstructions = useCallback((targetSection: string) => {
    if (!storeLayout || !currentPosition) {
      return null;
    }

    const currentSec = storeLayout.sections.find(s => s.id === currentSection);
    const targetSec = storeLayout.sections.find(s => s.id === targetSection);

    if (!currentSec || !targetSec) {
      return null;
    }

    const distance = Math.sqrt(
      Math.pow(targetSec.x - currentSec.x, 2) + 
      Math.pow(targetSec.y - currentSec.y, 2)
    );

    let direction = '';
    if (targetSec.x > currentSec.x) direction += 'right';
    else if (targetSec.x < currentSec.x) direction += 'left';
    
    if (targetSec.y > currentSec.y) direction += ' down';
    else if (targetSec.y < currentSec.y) direction += ' up';

    return {
      distance: Math.round(distance * 10), // Convert to meters
      direction,
      estimatedTime: Math.round(distance * 30), // seconds
      currentSection: STORE_SECTIONS[currentSection as keyof typeof STORE_SECTIONS],
      targetSection: STORE_SECTIONS[targetSection as keyof typeof STORE_SECTIONS]
    };
  }, [storeLayout, currentPosition, currentSection]);

  // Toggle tracking
  const toggleTracking = useCallback(() => {
    setIsTracking(prev => !prev);
  }, []);

  // Get nearby promotions based on current section
  const getNearbyPromotions = useCallback(() => {
    // This would typically fetch promotions from the API based on current location
    const sectionPromotions: Record<string, string[]> = {
      produce: ["15% Off Fresh Produce", "Buy 2kg Get 1kg Free on Onions"],
      dairy: ["Fresh Milk Daily Deal", "Combo Offer on Dairy Products"],
      spices: ["Spice Bundle Offers", "Buy 3 Get 1 Free on Powders"],
      snacks: ["Weekend Snack Deals", "Family Pack Discounts"],
      care: ["Personal Care Combo", "Health & Hygiene Offers"],
      checkout: ["Digital Payment Cashback", "Express Checkout Bonus"]
    };

    return sectionPromotions[currentSection] || [];
  }, [currentSection]);

  return {
    currentPosition,
    currentSection,
    isTracking,
    signal,
    storeLayout,
    navigateToSection,
    getNavigationInstructions,
    getNearbyPromotions,
    toggleTracking,
    sections: STORE_SECTIONS
  };
}

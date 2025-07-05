import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Zap, Gift, Coins, Trophy } from 'lucide-react';

interface FloatingParticleProps {
  x: number;
  y: number;
  type: 'sparkle' | 'star' | 'coin' | 'zap';
}

const FloatingParticle = ({ x, y, type }: FloatingParticleProps) => {
  const icons = {
    sparkle: <Sparkles className="h-4 w-4 text-yellow-400" />,
    star: <Star className="h-4 w-4 text-purple-400" />,
    coin: <Coins className="h-4 w-4 text-yellow-500" />,
    zap: <Zap className="h-4 w-4 text-blue-400" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x, y }}
      animate={{ 
        opacity: [0, 1, 1, 0], 
        scale: [0, 1.2, 1, 0.8],
        y: y - 100,
        rotate: [0, 180, 360]
      }}
      transition={{ duration: 2, ease: "easeOut" }}
      className="fixed pointer-events-none z-50"
    >
      {icons[type]}
    </motion.div>
  );
};

interface ScanBeamProps {
  isScanning: boolean;
}

export const ScanBeam = ({ isScanning }: ScanBeamProps) => {
  return (
    <AnimatePresence>
      {isScanning && (
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          exit={{ scaleY: 0, opacity: 0 }}
          className="absolute inset-0 bg-gradient-to-b from-transparent via-green-400/30 to-transparent"
        >
          <motion.div
            animate={{ y: [0, '100%', 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-full h-1 bg-green-400 shadow-lg shadow-green-400/50"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface PulseRingProps {
  size?: number;
  color?: string;
}

export const PulseRing = ({ size = 100, color = 'bg-blue-400' }: PulseRingProps) => {
  return (
    <div className="relative">
      <motion.div
        animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute inset-0 rounded-full ${color} opacity-20`}
        style={{ width: size, height: size }}
      />
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className={`absolute inset-0 rounded-full ${color} opacity-30`}
        style={{ width: size, height: size }}
      />
    </div>
  );
};

interface ShimmerEffectProps {
  children: React.ReactNode;
  isActive: boolean;
}

export const ShimmerEffect = ({ children, isActive }: ShimmerEffectProps) => {
  return (
    <div className="relative overflow-hidden">
      {children}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            exit={{ x: '100%' }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

interface ParticleSystemProps {
  isActive: boolean;
  centerX: number;
  centerY: number;
  count?: number;
}

export const ParticleSystem = ({ isActive, centerX, centerY, count = 10 }: ParticleSystemProps) => {
  const [particles, setParticles] = useState<FloatingParticleProps[]>([]);

  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: count }, (_, i) => ({
        x: centerX + (Math.random() - 0.5) * 100,
        y: centerY + (Math.random() - 0.5) * 50,
        type: ['sparkle', 'star', 'coin', 'zap'][Math.floor(Math.random() * 4)] as any
      }));
      
      setParticles(newParticles);
      
      // Clear particles after animation
      setTimeout(() => setParticles([]), 2000);
    }
  }, [isActive, centerX, centerY, count]);

  return (
    <>
      {particles.map((particle, index) => (
        <FloatingParticle key={index} {...particle} />
      ))}
    </>
  );
};

interface GlowEffectProps {
  children: React.ReactNode;
  isGlowing: boolean;
  color?: string;
}

export const GlowEffect = ({ children, isGlowing, color = 'blue' }: GlowEffectProps) => {
  return (
    <motion.div
      animate={{
        boxShadow: isGlowing 
          ? `0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.4)` 
          : 'none'
      }}
      transition={{ duration: 0.3 }}
      className="rounded-lg"
    >
      {children}
    </motion.div>
  );
};

interface CounterAnimationProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export const CounterAnimation = ({ value, prefix = '', suffix = '', duration = 0.5 }: CounterAnimationProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const start = displayValue;
    const end = value;
    const increment = (end - start) / (duration * 60); // 60fps

    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value, duration, displayValue]);

  return (
    <motion.span
      key={value}
      initial={{ scale: 1.2, color: '#10b981' }}
      animate={{ scale: 1, color: '#000000' }}
      transition={{ duration: 0.3 }}
    >
      {prefix}{displayValue.toLocaleString()}{suffix}
    </motion.span>
  );
};

interface SlideInNotificationProps {
  message: string;
  type: 'success' | 'info' | 'warning';
  isVisible: boolean;
  onClose: () => void;
}

export const SlideInNotification = ({ message, type, isVisible, onClose }: SlideInNotificationProps) => {
  const colors = {
    success: 'bg-green-100 border-green-500 text-green-800',
    info: 'bg-blue-100 border-blue-500 text-blue-800',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-800'
  };

  const icons = {
    success: <Trophy className="h-5 w-5" />,
    info: <Zap className="h-5 w-5" />,
    warning: <Gift className="h-5 w-5" />
  };

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className={`fixed top-20 right-4 z-50 p-4 rounded-lg border-l-4 shadow-lg max-w-sm ${colors[type]}`}
        >
          <div className="flex items-center space-x-3">
            {icons[type]}
            <p className="font-medium">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export const ProgressRing = ({ 
  progress, 
  size = 120, 
  strokeWidth = 8, 
  color = '#3b82f6' 
}: ProgressRingProps) => {
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span 
          className="text-lg font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          {Math.round(progress)}%
        </motion.span>
      </div>
    </div>
  );
};
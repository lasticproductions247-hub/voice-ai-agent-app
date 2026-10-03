import { useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
  state: 'idle' | 'connecting' | 'listening' | 'speaking' | 'thinking';
  gradientColors: string; // e.g. "from-blue-500 to-cyan-600"
}

export default function VoiceVisualizer({ state, gradientColors }: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Determine primary and secondary colors based on agent gradient
    let colorPrimary = '#6366f1'; // indigo-500
    let colorSecondary = '#3b82f6'; // blue-500

    if (gradientColors.includes('emerald')) {
      colorPrimary = '#10b981';
      colorSecondary = '#14b8a6';
    } else if (gradientColors.includes('orange')) {
      colorPrimary = '#f97316';
      colorSecondary = '#f59e0b';
    } else if (gradientColors.includes('purple')) {
      colorPrimary = '#a855f7';
      colorSecondary = '#6366f1';
    } else if (gradientColors.includes('rose')) {
      colorPrimary = '#f43f5e';
      colorSecondary = '#ec4899';
    } else if (gradientColors.includes('blue')) {
      colorPrimary = '#3b82f6';
      colorSecondary = '#06b6d4';
    }

    const render = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, width, height);

      phaseRef.current += 0.05;
      const phase = phaseRef.current;

      // Draw multi-layer glowing sine waves
      let waveCount = 3;
      let baseAmplitude = 15;
      let baseFrequency = 0.02;
      let speedMultiplier = 1;

      if (state === 'idle') {
        waveCount = 2;
        baseAmplitude = 4;
        baseFrequency = 0.01;
        speedMultiplier = 0.4;
      } else if (state === 'connecting') {
        waveCount = 3;
        baseAmplitude = 8;
        baseFrequency = 0.03;
        speedMultiplier = 1.5;
      } else if (state === 'listening') {
        // Pulse rhythmically mimicking voice listening
        waveCount = 4;
        baseAmplitude = 12 + Math.sin(phase * 1.5) * 6;
        baseFrequency = 0.025;
        speedMultiplier = 0.8;
      } else if (state === 'thinking') {
        // Rapid, smaller, highly concentrated waves
        waveCount = 5;
        baseAmplitude = 6 + Math.sin(phase * 2.5) * 2;
        baseFrequency = 0.06;
        speedMultiplier = 2;
      } else if (state === 'speaking') {
        // Large energetic speaking waves
        waveCount = 4;
        baseAmplitude = 25 + Math.sin(phase * 0.8) * 15;
        baseFrequency = 0.015;
        speedMultiplier = 1.2;
      }

      // Draw central visualizer core orb/glow
      const centerX = width / 2;
      const centerY = height / 2;
      
      const pulseRadius = state === 'speaking' 
        ? 65 + Math.sin(phase * 1.2) * 12 
        : state === 'listening'
        ? 55 + Math.sin(phase * 0.8) * 5
        : state === 'thinking'
        ? 50 + Math.sin(phase * 3.0) * 3
        : 45;

      // Create beautiful gradient radial glow
      const radialGrad = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, pulseRadius * 1.8
      );
      radialGrad.addColorStop(0, `${colorPrimary}18`);
      radialGrad.addColorStop(0.4, `${colorSecondary}0a`);
      radialGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = radialGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Draw waves
      for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        
        // Unique offsets per wave layer
        const amplitude = baseAmplitude * (1 - i * 0.18);
        const freq = baseFrequency * (1 + i * 0.12);
        const speed = (phase * speedMultiplier) + (i * 0.8);

        // Wave color gradient
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        const alpha = (1 - (i * 0.22)).toFixed(2);
        grad.addColorStop(0, `${colorPrimary}08`);
        grad.addColorStop(0.5, `${i % 2 === 0 ? colorPrimary : colorSecondary}${Math.floor(parseFloat(alpha) * 255).toString(16).padStart(2, '0')}`);
        grad.addColorStop(1, `${colorSecondary}08`);
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = i === 0 ? 3 : 1.5;
        ctx.lineCap = 'round';

        for (let x = 0; x < width; x++) {
          // Centralizing voice wave so it pinches at the ends
          const pinch = Math.sin((x / width) * Math.PI);
          const y = centerY + Math.sin(x * freq + speed) * amplitude * pinch;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Draw central pulsing core ring
      ctx.strokeStyle = `${colorPrimary}50`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `${colorSecondary}20`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius - 4, 0, Math.PI * 2);
      ctx.stroke();

      // Center indicator dot
      ctx.fillStyle = colorPrimary;
      ctx.beginPath();
      ctx.arc(
        centerX, 
        centerY, 
        state === 'thinking' ? 6 + Math.sin(phase * 3) * 2 : 6, 
        0, 
        Math.PI * 2
      );
      ctx.fill();

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [state, gradientColors]);

  return (
    <div className="relative w-full h-44 bg-slate-950/80 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
      {/* Decorative Status Indicator overlay */}
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-900/90 px-2.5 py-1 rounded-full border border-slate-800/60 text-xs font-mono text-slate-400">
        <span className={`h-2.5 w-2.5 rounded-full ${
          state === 'speaking' ? 'bg-green-500 animate-pulse' :
          state === 'listening' ? 'bg-blue-500 animate-ping' :
          state === 'thinking' ? 'bg-amber-500 animate-bounce' :
          state === 'connecting' ? 'bg-purple-500 animate-pulse' :
          'bg-slate-500'
        }`} />
        <span className="uppercase tracking-wider text-[10px]">
          {state === 'idle' && 'Agent Standby'}
          {state === 'connecting' && 'Initiating Call...'}
          {state === 'listening' && 'Mic Active: Listening...'}
          {state === 'thinking' && 'Agent Synthesizing...'}
          {state === 'speaking' && 'Agent Speaking'}
        </span>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Dynamic visual subtitle helper */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 text-slate-400 font-medium text-xs bg-slate-950/65 backdrop-blur px-3 py-1 rounded-full pointer-events-none border border-slate-800/40">
        {state === 'idle' && 'Click "Connect Call" to begin'}
        {state === 'connecting' && 'Opening secure audio socket...'}
        {state === 'listening' && 'Speak now! Say "Practice interview" or "Help me relax"'}
        {state === 'thinking' && 'Thinking...'}
        {state === 'speaking' && 'Interrupt by talking or clicking Stop'}
      </div>
    </div>
  );
}

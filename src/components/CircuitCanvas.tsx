import React, { useRef, useState, useCallback } from 'react';
import { Component, CircuitState } from './CircuitSimulator';

interface CircuitCanvasProps {
  circuitState: CircuitState;
  onComponentDrop: (component: Omit<Component, 'id' | 'isConnected' | 'position'>, position: { x: number; y: number }) => void;
  onComponentRemove: (componentId: string) => void;
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  circuitState,
  onComponentDrop,
  onComponentRemove,
}) => {
  const canvasRef = useRef<SVGSVGElement>(null);
  const [draggedComponent, setDraggedComponent] = useState<Omit<Component, 'id' | 'isConnected' | 'position'> | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    // Get component data from drag event
    let componentData;
    try {
      const dragData = e.dataTransfer.getData('text/plain');
      componentData = JSON.parse(dragData);
    } catch {
      console.log('No valid component data in drag event');
      return;
    }

    // Define gap areas - resistor gap and capacitor gap
    const resistorGap = {
      x: 300,
      y: 100,
      width: 120,
      height: 40,
    };

    const capacitorGap = {
      x: 300,
      y: 280,
      width: 120,
      height: 40,
    };

    // Check if drop is in appropriate gap
    const isInResistorGap = position.x >= resistorGap.x && 
                           position.x <= resistorGap.x + resistorGap.width &&
                           position.y >= resistorGap.y && 
                           position.y <= resistorGap.y + resistorGap.height;

    const isInCapacitorGap = position.x >= capacitorGap.x && 
                            position.x <= capacitorGap.x + capacitorGap.width &&
                            position.y >= capacitorGap.y && 
                            position.y <= capacitorGap.y + capacitorGap.height;

    // Only allow correct component types in correct gaps
    if ((componentData.type === 'resistor' && isInResistorGap) ||
        (componentData.type === 'capacitor' && isInCapacitorGap)) {
      onComponentDrop(componentData, position);
    }

    setDraggedComponent(null);
  }, [onComponentDrop]);

  // Enable drag and drop from external source
  React.useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      const componentData = (e.target as HTMLElement)?.dataset?.component;
      if (componentData) {
        setDraggedComponent(JSON.parse(componentData));
      }
    };

    document.addEventListener('dragstart', handleDragStart);
    return () => document.removeEventListener('dragstart', handleDragStart);
  }, []);

  const renderBulb = () => (
    <g className={circuitState.isComplete ? 'bulb-glow' : ''}>
      <circle
        cx="150"
        cy="120"
        r="20"
        fill={circuitState.isComplete ? 'hsl(var(--bulb-on))' : 'hsl(var(--component-body))'}
        stroke="hsl(var(--circuit-copper))"
        strokeWidth="2"
        className={circuitState.isComplete ? 'component-pulse' : ''}
      />
      <text x="150" y="125" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10">
        BULB
      </text>
    </g>
  );

  const renderMotor = () => (
    <g className={circuitState.isComplete ? '' : ''}>
      <rect
        x="130"
        y="250"
        width="40"
        height="30"
        fill={circuitState.isComplete ? 'hsl(var(--motor-active))' : 'hsl(var(--component-body))'}
        stroke="hsl(var(--circuit-copper))"
        strokeWidth="2"
        rx="5"
      />
      <circle
        cx="150"
        cy="265"
        r="8"
        fill="hsl(var(--circuit-copper))"
        className={circuitState.isComplete ? 'motor-spin' : ''}
      />
      <text x="150" y="295" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10">
        MOTOR
      </text>
    </g>
  );

  const renderBattery = () => (
    <g>
      <rect x="50" y="180" width="30" height="40" fill="hsl(var(--component-body))" stroke="hsl(var(--circuit-copper))" strokeWidth="2" rx="3" />
      <text x="65" y="200" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8">12V</text>
      <text x="65" y="210" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8">+</text>
      <text x="35" y="210" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="12">−</text>
    </g>
  );

  const renderCircuitTraces = () => (
    <g stroke="hsl(var(--circuit-trace))" strokeWidth="3" fill="none">
      {/* Battery to bulb */}
      <path
        d="M 80 200 L 130 200 L 130 120"
        className={circuitState.isComplete ? 'current-flow circuit-glow' : ''}
        strokeDasharray={circuitState.isComplete ? "5,5" : "none"}
      />
      
      {/* Bulb to resistor gap */}
      <path
        d="M 170 120 L 300 120"
        className={circuitState.isComplete ? 'current-flow circuit-glow' : ''}
        strokeDasharray={circuitState.isComplete ? "5,5" : "none"}
      />
      
      {/* Resistor gap area */}
      <path
        d="M 300 120 L 420 120"
        stroke={circuitState.components.some(c => c.type === 'resistor' && c.isConnected) ? 'hsl(var(--circuit-trace))' : 'hsl(var(--circuit-incomplete))'}
        strokeDasharray="10,5"
        className={!circuitState.components.some(c => c.type === 'resistor' && c.isConnected) ? 'gap-pulse' : circuitState.isComplete ? 'current-flow circuit-glow' : ''}
      />
      
      {/* From resistor gap to junction */}
      <path
        d="M 420 120 L 500 120 L 500 200 L 450 200"
        className={circuitState.isComplete ? 'current-flow circuit-glow' : ''}
        strokeDasharray={circuitState.isComplete ? "5,5" : "none"}
      />
      
      {/* Vertical connection to capacitor gap */}
      <path
        d="M 450 200 L 450 280 L 420 280"
        className={circuitState.isComplete ? 'current-flow circuit-glow' : ''}
        strokeDasharray={circuitState.isComplete ? "5,5" : "none"}
      />
      
      {/* Capacitor gap area */}
      <path
        d="M 420 280 L 300 280"
        stroke={circuitState.components.some(c => c.type === 'capacitor' && c.isConnected) ? 'hsl(var(--circuit-trace))' : 'hsl(var(--circuit-incomplete))'}
        strokeDasharray="10,5"
        className={!circuitState.components.some(c => c.type === 'capacitor' && c.isConnected) ? 'gap-pulse' : circuitState.isComplete ? 'current-flow circuit-glow' : ''}
      />
      
      {/* From capacitor gap to motor */}
      <path
        d="M 300 280 L 170 280 L 170 265"
        className={circuitState.isComplete ? 'current-flow circuit-glow' : ''}
        strokeDasharray={circuitState.isComplete ? "5,5" : "none"}
      />
      
      {/* Motor back to battery */}
      <path
        d="M 130 265 L 30 265 L 30 200 L 50 200"
        className={circuitState.isComplete ? 'current-flow circuit-glow' : ''}
        strokeDasharray={circuitState.isComplete ? "5,5" : "none"}
      />
    </g>
  );

  const renderGapIndicators = () => (
    <g>
      {/* Resistor Gap */}
      {!circuitState.components.some(c => c.type === 'resistor' && c.isConnected) && (
        <g>
          <rect
            x="300"
            y="100"
            width="120"
            height="40"
            fill="hsl(var(--circuit-gap) / 0.1)"
            stroke="hsl(var(--circuit-gap))"
            strokeWidth="2"
            strokeDasharray="5,5"
            rx="5"
            className="gap-pulse"
          />
          <text x="360" y="115" textAnchor="middle" fill="hsl(var(--circuit-gap))" fontSize="10" fontWeight="bold">
            RESISTOR
          </text>
          <text x="360" y="125" textAnchor="middle" fill="hsl(var(--circuit-gap))" fontSize="10" fontWeight="bold">
            DROP HERE
          </text>
        </g>
      )}
      
      {/* Capacitor Gap */}
      {!circuitState.components.some(c => c.type === 'capacitor' && c.isConnected) && (
        <g>
          <rect
            x="300"
            y="280"
            width="120"
            height="40"
            fill="hsl(var(--circuit-gap) / 0.1)"
            stroke="hsl(var(--circuit-gap))"
            strokeWidth="2"
            strokeDasharray="5,5"
            rx="5"
            className="gap-pulse"
          />
          <text x="360" y="295" textAnchor="middle" fill="hsl(var(--circuit-gap))" fontSize="10" fontWeight="bold">
            CAPACITOR
          </text>
          <text x="360" y="305" textAnchor="middle" fill="hsl(var(--circuit-gap))" fontSize="10" fontWeight="bold">
            DROP HERE
          </text>
        </g>
      )}
    </g>
  );

  const renderComponents = () => (
    <g>
      {circuitState.components.map((component) => (
        <g key={component.id} transform={`translate(${component.position?.x || 0}, ${component.position?.y || 0})`}>
          {component.type === 'resistor' ? (
            <g>
              <rect
                x="-20"
                y="-8"
                width="40"
                height="16"
                fill="hsl(var(--component-active))"
                stroke="hsl(var(--circuit-copper))"
                strokeWidth="2"
                rx="2"
                className="circuit-glow"
              />
              <text x="0" y="4" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontWeight="bold">
                {component.value}Ω
              </text>
            </g>
          ) : (
            <g>
              <rect x="-15" y="-8" width="30" height="16" fill="hsl(var(--component-active))" stroke="hsl(var(--circuit-copper))" strokeWidth="2" rx="2" className="circuit-glow" />
              <rect x="-12" y="-5" width="24" height="2" fill="hsl(var(--circuit-copper))" />
              <rect x="-12" y="3" width="24" height="2" fill="hsl(var(--circuit-copper))" />
              <text x="0" y="25" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontWeight="bold">
                {component.value}μF
              </text>
            </g>
          )}
          <circle
            cx="0"
            cy="0"
            r="12"
            fill="transparent"
            className="cursor-pointer hover:fill-red-500/20"
            onClick={() => onComponentRemove(component.id)}
          />
        </g>
      ))}
    </g>
  );

  return (
    <div className="w-full h-96 bg-component-body rounded-lg border-2 border-border">
      <svg
        ref={canvasRef}
        width="100%"
        height="100%"
        viewBox="0 0 600 350"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="w-full h-full"
      >
        {/* Grid background */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {renderCircuitTraces()}
        {renderBattery()}
        {renderBulb()}
        {renderMotor()}
        {renderGapIndicators()}
        {renderComponents()}
      </svg>
    </div>
  );
};
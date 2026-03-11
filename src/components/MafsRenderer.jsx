import React, { useMemo } from 'react';
import { Mafs, Coordinates, Plot, Point, Vector, Circle, Text, Theme } from 'mafs';

// Import styles
import "mafs/core.css";
import "mafs/font.css";

export default function MafsRenderer({ config }) {
    // Sanitize and parse functions safely-ish for a math demo
    // In a production app, we'd use a math parser like mathjs
    const elements = useMemo(() => {
        if (!config || !config.elements) return [];
        
        return config.elements.map((el, i) => {
            try {
                switch (el.type) {
                    case 'plot-of-x':
                        return <Plot.OfX key={i} y={new Function('x', `return ${el.fn}`)} color={el.color || Theme.blue} />;
                    case 'plot-of-y':
                        return <Plot.OfY key={i} x={new Function('y', `return ${el.fn}`)} color={el.color || Theme.blue} />;
                    case 'point':
                        return <Point key={i} x={el.x} y={el.y} color={el.color || Theme.red} />;
                    case 'vector':
                        return <Vector key={i} tail={[el.tailX || 0, el.tailY || 0]} tip={[el.tipX || 0, el.tipY || 0]} color={el.color || Theme.green} />;
                    case 'circle':
                        return <Circle key={i} center={[el.centerX || 0, el.centerY || 0]} radius={el.radius || 1} color={el.color || Theme.blue} />;
                    case 'text':
                    case 'label':
                        return <Text key={i} x={el.x || 0} y={el.y || 0} attach={el.attach || "sw"}>{el.text || ""}</Text>;
                    default:
                        return null;
                }
            } catch (e) {
                console.error("Failed to render mathematical element:", e);
                return null;
            }
        });
    }, [config]);

    if (!config) return null;

    return (
        <div className="w-full aspect-video rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20 my-10 shadow-inner group relative">
            <div className="absolute top-4 left-6 z-10">
                <span className="text-[10px] font-black text-indigo-500/40 tracking-[0.3em] uppercase">Interactive Graph</span>
            </div>
            
            <Mafs
                viewBox={config.viewBox || { x: [-10, 10], y: [-10, 10] }}
                height={window.innerWidth < 768 ? 300 : 400}
                zoom={{ min: 0.1, max: 10 }}
                pan={true}
            >
                <Coordinates.Cartesian 
                    subdivisions={config.subdivisions || 2}
                    xAxis={{ lines: config.xAxisLines || 1 }}
                    yAxis={{ lines: config.yAxisLines || 1 }}
                />
                {elements}
            </Mafs>
        </div>
    );
}

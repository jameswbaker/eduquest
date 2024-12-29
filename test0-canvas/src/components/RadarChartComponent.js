import React, { useState } from 'react';
import RadarChart from 'react-svg-radar-chart';
import 'react-svg-radar-chart/build/css/index.css';

function RadarChartComponent({ filteredCaptions, filteredData, size, style }) {
    const [popup, setPopup] = useState({ visible: false, value: '' });

    const noSmoothing = points => {
        let d = 'M' + points[0][0].toFixed(4) + ',' + points[0][1].toFixed(4);
        for (let i = 1; i < points.length; i++) {
            d += 'L' + points[i][0].toFixed(4) + ',' + points[i][1].toFixed(4);
        }
        return d + 'z';
    };

    const options = {
        size: 400,
        axes: true,
        scales: 4,
        captions: true,
        captionMargin: 100,
        dots: true,
        zoomDistance: 1.2,
        setViewBox: (options) => `-${options.captionMargin} 0 ${options.size + options.captionMargin * 2} ${options.size}`,
        smoothing: noSmoothing,
        axisProps: () => ({ className: 'axis' }),
        scaleProps: () => ({ className: 'scale', fill: 'none' }),
        shapeProps: () => ({ className: 'shape' }),
        captionProps: () => ({
            className: 'caption',
            textAnchor: 'middle',
            fontSize: 20,
            fontFamily: 'sans-serif',
            style: { whiteSpace: 'nowrap' }
        }),
        dotProps: () => ({
            className: 'dot',
            color: '#333',
            // mouseEnter: (dot) => { setPopup({ visible: true, value: dot.value }); },
            // mouseLeave: () => { setPopup({ visible: false, value: '' }); }
        }),
        rotation: 0,
        wrapCaptionAt: 100,
    };

    return (
        <div>
            <RadarChart
                captions={filteredCaptions}
                data={filteredData}
                size={size}
                style={style}
                options={options}
            />
            
            {popup.visible && (
                <div className="popup" style={{ position: 'absolute', top: '50px', left: '50px', background: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <p>{popup.value}</p>
                </div>
            )}
        </div>
    );
}

export default RadarChartComponent;

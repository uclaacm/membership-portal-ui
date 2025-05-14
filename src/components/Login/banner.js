import React, { useState, useEffect } from 'react';
import './banner.scss';

// Helper function to create arrays with mapped values
const mapUpToSum = (num, fn) => {
  const res = [];
  for (let i = 0; i < num; i++) res.push(fn(i, res));
  return res;
};

// Helper function to generate a mask around the title area
const generateCols = (n, m, centerX, centerY, maskRadius = 2, randomize = false) => {
  return mapUpToSum(n, (i) => (
    <div className="square-col" key={i}>
      {mapUpToSum(m, (j) => {
        const classNames = ['square'];
        
        // Check if the square is within the masked area
        const diamondMask = new Set([
          '-3,-1','-3,0',
          '-2,-1','-2,0','-2,1',
          '-1,-1','-1,0','-1,1',            // 3 squares one column left
          '0,-1','0,0','0,1',   // 5 squares in the center column
          '1,-1','1,0','1,1',
          '2,0','2,1',                // 3 squares one column right
        ]);

        // …inside your generateCols:
        const dx = i - centerX;
        const dy = j - centerY;
        const isMasked = diamondMask.has(`${dx},${dy}`);

        if (isMasked) {
          classNames.push('white');
        } else if (randomize) {
          const r = Math.random();
          if (r < 0.08) classNames.push('white');
          else if (r < 0.4) classNames.push('light');
        }

        return <div className={classNames.join(' ')} key={j} />;
      })}
    </div>
  ));
};

const Banner = (props) => {
  const [randomize, setRandomize] = useState(false);
  const [color, setColor] = useState(0);
  let timer;

  useEffect(() => {
    setRandomize(true);

    const committees = ['acm'];
    if (!props.decorative) {
      committees.push(
        'studio',
        'icpc',
        'design',
        'cyber',
        'teachla',
        'w',
        'ai',
        'hack',
      );
    }

    const el = document.querySelector('.banner');
    const id = setInterval(() => {
      setColor((prev) => {
        // remove the old class
        el.classList.remove(committees[prev]);

        // compute next, wrapping back to 0 when you hit the end
        const next = (prev + 1) % committees.length;

        // add the new class
        el.classList.add(committees[next]);

        return next;
      });
    }, 4000);

    return () => clearInterval(id);
  }, [props.decorative]);

  const decorative = props.decorative || false;
  const sideCols = props.sideCols || (decorative ? 12 : 27);
  const height = props.height || (decorative ? 2 : 27);
  const width = props.width || 5;
  
  // Calculate the center for the mask
  const centerX = Math.floor(sideCols / 2);
  const centerY = Math.floor(height / 2);

  return (
    <div className={`banner ${decorative ? 'decorative' : ''}`}>
      <div className="square-col-container">
        {generateCols(sideCols, height, centerX, centerY, 2, randomize)}
      </div>
      {!decorative && (
        <div className="title">
          <h1>code the future.</h1>
        </div>
      )}
    </div>
  );
};

export default Banner;

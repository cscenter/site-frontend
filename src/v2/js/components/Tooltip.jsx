import * as PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { Tooltip as BaseTooltip } from 'react-tippy';

export const Tooltip = ({ title, children, interactive: interactiveProp, ...options }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    setIsMobile(mediaQuery.matches);
    const handler = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const tippyProps = {
    animation: 'fade',
    arrow: true,
    arrowSize: 'small',
    size: 'regular',
    theme: 'dark',
    ...options,
    title: title,
    ...(isMobile
      ? {
          trigger: 'click',
          interactive: true,
          hideOnClick: false
        }
      : {
          trigger: 'mouseenter focus',
          interactive: interactiveProp || false
        })
  };

  return <BaseTooltip {...tippyProps}>{children}</BaseTooltip>;
};

Tooltip.propTypes = {
  title: PropTypes.string,
  children: PropTypes.element.isRequired,
  interactive: PropTypes.bool
};

export const Hint = ({ ...options }) => (
  <Tooltip {...options}>
    <span className="tooltip__icon _rounded">?</span>
  </Tooltip>
);

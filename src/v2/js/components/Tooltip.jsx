import * as PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { Tooltip as BaseTooltip } from 'react-tippy';

export const Tooltip = ({ title, children, interactive: interactiveProp, ...options }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Проверяем поддержку pointer: coarse (обычно указывает на сенсорный ввод)
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    setIsMobile(mediaQuery.matches);

    // Добавляем слушатель на случай изменения (например, при подключении/отключении мыши)
    // Хотя это редкий кейс для определения "мобильности", но для полноты картины
    const handler = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);

    // Очистка слушателя при размонтировании
    return () => mediaQuery.removeEventListener('change', handler);
  }, []); // Пустой массив зависимостей гарантирует выполнение эффекта один раз при монтировании

  const tippyProps = {
    animation: 'fade',
    arrow: true,
    arrowSize: 'small',
    size: 'regular',
    theme: 'dark',
    ...options, // Передаем остальные пропсы
    title: title,
    ...(isMobile
      ? {
          trigger: 'click',
          interactive: true, // На мобильных всегда интерактивно для закрытия по клику вне тултипа
          hideOnClick: false // Не скрывать при клике внутри тултипа на мобильных
        }
      : {
          trigger: 'mouseenter focus', // Стандартное поведение для десктопа
          interactive: interactiveProp || false, // Уважаем переданный проп interactive или ставим false
          // hideOnClick использует значение по умолчанию для десктопа
        })
  };

  return <BaseTooltip {...tippyProps}>{children}</BaseTooltip>;
};

Tooltip.propTypes = {
  title: PropTypes.string,
  children: PropTypes.element.isRequired,
  interactive: PropTypes.bool // Добавляем interactive в propTypes
};

export const Hint = ({ ...options }) => (
  <Tooltip {...options}>
    <span className="tooltip__icon _rounded">?</span>
  </Tooltip>
);

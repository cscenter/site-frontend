import PropTypes from 'prop-types';
import React from 'react';

import cn from 'classnames';
import _isNil from 'lodash-es/isNil';

function computeTabIndex(disabled, tabIndex) {
  if (disabled) {
    return -1;
  }
  if (!_isNil(tabIndex)) {
    return tabIndex;
  }
}

const Input = React.forwardRef(
  (
    {
      type = 'text',
      autoComplete = 'off',
      className = '',
      disabled = false,
      tabIndex = null,
      ...rest
    },
    ref
  ) => {
    const computedTabIndex = computeTabIndex(disabled, tabIndex);

    return (
      <div
        className={cn({
          'ui input': type !== 'file',
          [className]: className.length > 0,
          disabled: disabled
        })}
      >
        <input
          tabIndex={computedTabIndex}
          autoComplete={autoComplete}
          type={type}
          disabled={disabled}
          {...rest}
          ref={ref}
        />
      </div>
    );
  }
);

Input.propTypes = {
  onChange: PropTypes.func,
  type: PropTypes.string,
  tabIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  value: PropTypes.string,
  /** An Input field can show a user is currently interacting with it. */
  focus: PropTypes.bool,
  /** Additional classes. */
  className: PropTypes.string,
  autoComplete: PropTypes.string,
  disabled: PropTypes.bool
};

export default Input;

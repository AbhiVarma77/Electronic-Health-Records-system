import React from 'react';

const Message = ({ type, message }) => {
  return (
    <div className="d-flex align-items-center justify-content-center">
      <div
        className={`alert mt-4 mb-4 w-75 ${
          type === 'success'
            ? 'alert-success'
            : type === 'fail'
            ? 'alert-danger'
            : 'alert-primary'
        }`}
      >
        {message}
      </div>{' '}
    </div>
  );
};

export default Message;

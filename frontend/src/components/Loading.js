import React from 'react';

const Loading = () => {
    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: '80vh' }}
        >
            <div className="text-center">
                <div className="spinner mb-3"></div>
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            </div>
        </div>
    );
};

export default Loading;

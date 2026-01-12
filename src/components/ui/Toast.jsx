import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import './Toast.css';

const Toast = ({ message, type = 'success', isVisible }) => {
    return (
        <div className={`neon-toast ${type} ${isVisible ? 'visible' : ''}`}>
            {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{message}</span>
        </div>
    );
};

export default Toast;

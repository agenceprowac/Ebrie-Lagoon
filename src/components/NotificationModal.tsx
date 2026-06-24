import React from 'react';

type NotificationModalProps = {
    notification: { message: string, type: 'success' | 'error' } | null;
    onClose: () => void;
};

export const NotificationModal: React.FC<NotificationModalProps> = ({ notification, onClose }) => {
    if (!notification) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${notification.type === 'success' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                    <i className={`fa-solid text-4xl ${notification.type === 'success' ? 'fa-check' : 'fa-triangle-exclamation'}`}></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {notification.type === 'success' ? 'Succès' : 'Attention'}
                </h3>
                <p className="text-gray-600 mb-8">{notification.message}</p>
                <button onClick={onClose} className={`w-full py-3.5 font-semibold rounded-xl shadow-lg transition text-white ${notification.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'}`}>
                    OK
                </button>
            </div>
        </div>
    );
};

import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/Context/LanguageContext';

export default function FlashAlert() {
    const { flash = {}, errors = {} } = usePage().props;
    const { t } = useLanguage();
    const [visible, setVisible] = useState(false);
    const [alertData, setAlertData] = useState({ type: 'success', title: '', message: '' });

    useEffect(() => {
        if (flash?.success) {
            setAlertData({
                type: 'success',
                title: t('success'),
                message: flash.success,
            });
            setVisible(true);
        } else if (flash?.error) {
            setAlertData({
                type: 'error',
                title: t('error'),
                message: flash.error,
            });
            setVisible(true);
        } else if (errors?.delete) {
            setAlertData({
                type: 'error',
                title: t('error'),
                message: errors.delete,
            });
            setVisible(true);
        } else if (Object.keys(errors).length > 0) {
            // When there are validation errors (e.g. duplicate unique attribute)
            const firstKey = Object.keys(errors)[0];
            const firstMsg = errors[firstKey];
            const otherCount = Object.keys(errors).length - 1;

            setAlertData({
                type: 'error',
                title: t('validation_error'),
                message: otherCount > 0 ? `${firstMsg} (+ ${otherCount} ${t('error')}(s))` : firstMsg,
            });
            setVisible(true);
        }
    }, [flash, errors, t]);

    // Auto-dismiss timer (6 seconds)
    useEffect(() => {
        if (!visible) return;
        const timer = setTimeout(() => {
            setVisible(false);
        }, 6000);
        return () => clearTimeout(timer);
    }, [visible, alertData]);

    if (!visible) return null;

    const isSuccess = alertData.type === 'success';

    return (
        <aside
            aria-label="Notification d'état"
            role="status"
            className="fixed top-5 right-5 z-[9999] max-w-md w-full animate-bounce-in shadow-2xl rounded-2xl overflow-hidden pointer-events-auto transition-all"
        >
            <div
                className={`p-4 border backdrop-blur-xl flex items-start gap-3.5 ${
                    isSuccess
                        ? 'bg-emerald-950/90 dark:bg-emerald-950/95 border-emerald-500/40 text-emerald-100'
                        : 'bg-rose-950/90 dark:bg-rose-950/95 border-rose-500/40 text-rose-100'
                }`}
            >
                {/* Icon */}
                <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-xl font-bold shadow-md ${
                        isSuccess
                            ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                            : 'bg-rose-500 text-white shadow-rose-500/30'
                    }`}
                >
                    {isSuccess ? '✓' : '⚠️'}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                    <h4 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-2">
                        {alertData.title}
                    </h4>
                    <p className="text-xs mt-1 text-slate-200 leading-relaxed font-medium">
                        {alertData.message}
                    </p>
                </div>

                {/* Close Button */}
                <button
                    onClick={() => setVisible(false)}
                    className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                    title="Fermer la notification"
                >
                    ✕
                </button>
            </div>

            {/* Bottom Progress Accent Bar */}
            <div
                className={`h-1 w-full animate-shrink-bar ${
                    isSuccess ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
            />
        </aside>
    );
}

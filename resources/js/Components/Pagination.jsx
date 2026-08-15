import React from 'react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Pagination({
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 15, 25, 50],
}) {
    const { t } = useLanguage();

    if (totalItems === 0) {
        return null;
    }

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    // Calculate smart page numbers with ellipsis
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible + 2) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            let leftBoundary = Math.max(2, currentPage - 1);
            let rightBoundary = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) {
                leftBoundary = 2;
                rightBoundary = 4;
            } else if (currentPage >= totalPages - 2) {
                leftBoundary = totalPages - 3;
                rightBoundary = totalPages - 1;
            }

            if (leftBoundary > 2) {
                pages.push('...');
            }

            for (let i = leftBoundary; i <= rightBoundary; i++) {
                pages.push(i);
            }

            if (rightBoundary < totalPages - 1) {
                pages.push('...');
            }

            pages.push(totalPages);
        }

        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-b-xl">
            {/* Range and count indicator */}
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t('pagination_showing', { from: startItem, to: endItem, total: totalItems })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {/* Page Size Selector */}
                {onPageSizeChange && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span>{t('pagination_lines')}</span>
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-lg px-2 py-1 focus:ring-1 focus:ring-[#11508f] focus:border-[#11508f] outline-none cursor-pointer font-semibold"
                        >
                            {pageSizeOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt} / page
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Page Navigation */}
                {totalPages > 1 && (
                    <nav className="inline-flex items-center gap-1">
                        {/* Prev button */}
                        <button
                            type="button"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition text-xs font-semibold"
                            title={t('pagination_prev')}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Page Numbers */}
                        {pages.map((p, idx) => {
                            if (p === '...') {
                                return (
                                    <span
                                        key={`ellipsis-${idx}`}
                                        className="h-8 w-8 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 font-semibold select-none"
                                    >
                                        …
                                    </span>
                                );
                            }

                            const isActive = p === currentPage;
                            return (
                                <button
                                    key={`page-${p}`}
                                    type="button"
                                    onClick={() => onPageChange(p)}
                                    className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                                        isActive
                                            ? 'bg-[#11508f] text-white shadow-md shadow-[#11508f]/20'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {p}
                                </button>
                            );
                        })}

                        {/* Next button */}
                        <button
                            type="button"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition text-xs font-semibold"
                            title={t('pagination_next')}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </nav>
                )}
            </div>
        </div>
    );
}

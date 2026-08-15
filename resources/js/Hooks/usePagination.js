import { useState, useMemo, useEffect } from 'react';

/**
 * Custom hook for client-side table pagination.
 *
 * @param {Array} items - The full or filtered array of items to paginate.
 * @param {number} defaultPageSize - Default rows per page (default: 10).
 * @param {Array} dependencies - Additional dependencies (e.g. search query, filters) that should trigger page reset to 1.
 */
export function usePagination(items = [], defaultPageSize = 10, dependencies = []) {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    // Reset to page 1 whenever items length changes or any external filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [items.length, ...dependencies]);

    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    // Ensure currentPage does not exceed totalPages if items are reduced
    const safePage = Math.min(Math.max(1, currentPage), totalPages);

    const paginatedItems = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return items.slice(start, start + pageSize);
    }, [items, safePage, pageSize]);

    const handlePageSizeChange = (newSize) => {
        const parsed = Number(newSize);
        if (!isNaN(parsed) && parsed > 0) {
            setPageSize(parsed);
            setCurrentPage(1);
        }
    };

    return {
        currentPage: safePage,
        setCurrentPage,
        pageSize,
        setPageSize: handlePageSizeChange,
        totalItems,
        totalPages,
        paginatedItems,
    };
}

export default usePagination;

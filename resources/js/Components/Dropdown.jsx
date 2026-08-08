import { Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const DropDownContext = createContext();

const Dropdown = ({ children }) => {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef(null);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen, triggerRef }}>
            <div className="relative inline-block text-left">{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }) => {
    const { open, setOpen, toggleOpen, triggerRef } = useContext(DropDownContext);

    return (
        <>
            <div ref={triggerRef} onClick={toggleOpen} className="cursor-pointer inline-block">
                {children}
            </div>

            {open && (
                <div
                    className="fixed inset-0 z-[9998]"
                    onClick={() => setOpen(false)}
                ></div>
            )}
        </>
    );
};

const Content = ({
    align = 'right',
    width = '48',
    contentClasses = 'py-1.5 bg-white dark:bg-[#111827] dark:border dark:border-slate-800/80 shadow-2xl',
    children,
}) => {
    const { open, setOpen, triggerRef } = useContext(DropDownContext);
    const [coords, setCoords] = useState(null);

    useEffect(() => {
        if (open && triggerRef.current) {
            const updateCoords = () => {
                const rect = triggerRef.current.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const spaceBelow = viewportHeight - rect.bottom;
                const menuWidth = width === '56' ? 224 : width === '36' ? 144 : 200;
                const estimatedHeight = 220;

                const placeUp = spaceBelow < estimatedHeight && rect.top > estimatedHeight;

                let top = placeUp ? rect.top - estimatedHeight - 4 : rect.bottom + 6;
                let left = align === 'left' ? rect.left : rect.right - menuWidth;

                left = Math.max(10, Math.min(left, window.innerWidth - menuWidth - 10));
                top = Math.max(10, Math.min(top, viewportHeight - estimatedHeight - 10));

                setCoords({ top, left, width: menuWidth });
            };

            updateCoords();
            window.addEventListener('resize', updateCoords);
            window.addEventListener('scroll', updateCoords, true);

            return () => {
                window.removeEventListener('resize', updateCoords);
                window.removeEventListener('scroll', updateCoords, true);
            };
        }
    }, [open, align, width, triggerRef]);

    if (!open || !coords) return null;

    const menuContent = (
        <Transition
            show={open}
            appear={true}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
        >
            <div
                style={{
                    position: 'fixed',
                    top: `${coords.top}px`,
                    left: `${coords.left}px`,
                    width: `${coords.width}px`,
                    zIndex: 9999,
                }}
                onClick={() => setOpen(false)}
            >
                <div
                    className={
                        `rounded-2xl ring-1 ring-black/10 dark:ring-white/10 overflow-hidden shadow-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] ` +
                        contentClasses
                    }
                >
                    {children}
                </div>
            </div>
        </Transition>
    );

    return typeof document !== 'undefined'
        ? createPortal(menuContent, document.body)
        : null;
};

const DropdownLink = ({ className = '', children, ...props }) => {
    return (
        <Link
            {...props}
            className={
                'block w-full px-4 py-2 text-start text-xs font-semibold text-slate-700 dark:text-slate-200 transition duration-150 ease-in-out hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none ' +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;

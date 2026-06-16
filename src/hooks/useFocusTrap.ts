import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accesibilidad de modales: cuando `active` es true, atrapa el foco dentro del
 * elemento referenciado (Tab/Shift+Tab circulan), enfoca el primer elemento al
 * abrir, llama a `onEscape` con la tecla Escape y devuelve el foco al elemento
 * previo al cerrar.
 *
 * Uso:
 *   const ref = useFocusTrap<HTMLDivElement>(isOpen, onClose);
 *   {isOpen && <div ref={ref} role="dialog" aria-modal="true"> ... </div>}
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean, onEscape?: () => void) {
    const ref = useRef<T>(null);
    // onEscape se guarda en un ref para que el efecto NO dependa de su identidad:
    // si dependiera, cada render recrearía el listener y robaría el foco al primer
    // elemento en cada pulsación. Así el efecto solo se re-ejecuta al abrir/cerrar.
    const onEscapeRef = useRef(onEscape);
    // Actualizamos el ref tras el render (no durante) para tener siempre el
    // último onEscape sin que el efecto de la trampa dependa de su identidad.
    useEffect(() => {
        onEscapeRef.current = onEscape;
    });

    useEffect(() => {
        if (!active) return;
        const node = ref.current;
        if (!node) return;

        const previouslyFocused = document.activeElement as HTMLElement | null;
        const getFocusables = () =>
            Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
                (el) => el.offsetParent !== null,
            );

        // Foco inicial en el primer elemento enfocable del modal.
        getFocusables()[0]?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onEscapeRef.current?.();
                return;
            }
            if (e.key !== 'Tab') return;
            const focusables = getFocusables();
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        node.addEventListener('keydown', handleKeyDown);
        return () => {
            node.removeEventListener('keydown', handleKeyDown);
            previouslyFocused?.focus?.();
        };
    }, [active]);

    return ref;
}

import { useRef, useState } from 'react';

/**
 * @param {(file: File) => void} onFile
 */
export function useDragDropFile(onFile) {
    const [dragOver, setDragOver] = useState(false);
    const depth = useRef(0);

    const reset = () => {
        depth.current = 0;
        setDragOver(false);
    };

    return {
        dragOver,
        dropzoneProps: {
            onDragEnter: (event) => {
                event.preventDefault();
                event.stopPropagation();
                depth.current += 1;
                setDragOver(true);
            },
            onDragLeave: (event) => {
                event.preventDefault();
                event.stopPropagation();
                depth.current -= 1;
                if (depth.current <= 0) {
                    reset();
                }
            },
            onDragOver: (event) => {
                event.preventDefault();
                event.stopPropagation();
            },
            onDrop: (event) => {
                event.preventDefault();
                event.stopPropagation();
                reset();
                const file = event.dataTransfer?.files?.[0];
                if (file) {
                    onFile(file);
                }
            },
        },
    };
}

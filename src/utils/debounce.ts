export function debounce<Args extends unknown[]>(
    fn: (...args: Args) => void,
    delay: number
): (...args: Args) => void {
    let timerId: ReturnType<typeof setTimeout> | null = null;
    return (...args: Args): void => {
        if (timerId !== null) {
            clearTimeout(timerId);
        }

        timerId = setTimeout(() => {
            timerId = null;
            fn(...args);
        }, delay);
    };
}

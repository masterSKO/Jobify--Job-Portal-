import { useEffect } from 'react';

/**
 * Custom hook that detects clicks outside of the referenced element
 * @param {React.RefObject} ref - The ref object attached to the element you want to detect clicks outside of
 * @param {Function} handler - The callback function to execute when a click outside is detected
 */
export const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    // Define the listener function
    const listener = (event) => {
      // Do nothing if clicking the ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }

      // Call the handler function
      handler(event);
    };

    // Add event listeners
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // Clean up event listeners when component unmounts
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]); // Re-run if ref or handler changes
};

export default useOnClickOutside; 
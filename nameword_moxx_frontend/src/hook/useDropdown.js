import { useState, useEffect, useRef } from 'react';

const useDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const toggle = () => setIsOpen(prev => !prev);
  const close = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return { isOpen, toggle, close, ref };
};

export default useDropdown;

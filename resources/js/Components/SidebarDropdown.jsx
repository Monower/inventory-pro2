import { useState } from 'react';

export default function SidebarDropdown({ title, icon, children }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {/* Dropdown Trigger */}
      <button
        onClick={toggleDropdown}
        className="sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700 w-full text-left"
      >
        {icon && <span className="mr-2">{icon}</span>}
        <span className="sidebar-text flex-1">{title}</span>
        {/* <i className={`fas fa-chevron-down transition-transform ${isOpen ? 'rotate-180' : ''}`}></i> */}
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="ml-10 mt-2 space-y-2">
          {children}
        </div>
      )}
      {/* {isOpen && (
        <div className="ml-10 mt-2 space-y-2">
          {childrenLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="block text-gray-600 hover:text-gray-800"
            >
              {link.label}
            </a>
          ))}
        </div>
      )} */}
    </div>
  );
}

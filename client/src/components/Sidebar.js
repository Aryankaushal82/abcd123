import React from 'react';
import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { XIcon } from '@heroicons/react/outline';
import {
  HomeIcon,
  PencilAltIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  PlusCircleIcon,
} from '@heroicons/react/outline';
import { closeSidebar } from '../redux/slices/uiSlice';
import PropTypes from 'prop-types';

const Sidebar = ({ mobile = false }) => {
  const dispatch = useDispatch();

  const handleCloseSidebar = () => {
    dispatch(closeSidebar());
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Create Post', href: '/posts/create', icon: PlusCircleIcon },
    { name: 'Scheduled Posts', href: '/posts/scheduled', icon: ClockIcon },
    { name: 'Published Posts', href: '/posts/published', icon: CheckCircleIcon },
    { name: 'Drafts', href: '/posts/drafts', icon: DocumentTextIcon },
  ];

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {mobile && (
        <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 bg-white">
          <div className="text-xl font-semibold text-gray-900">
            Social Media Scheduler
          </div>
          <button
            type="button"
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={handleCloseSidebar}
          >
            <span className="sr-only">Close sidebar</span>
            <XIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150`
              }
              onClick={mobile ? handleCloseSidebar : undefined}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-6 w-6 transition-colors duration-150`}
                    aria-hidden="true"
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  mobile: PropTypes.bool,
};

export default Sidebar;
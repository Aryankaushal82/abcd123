import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { PlusIcon, ClockIcon, CheckIcon, DocumentTextIcon } from '@heroicons/react/outline';
import { getPosts } from '../services/postService';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';

const Dashboard = () => {
  // Fetch posts data
  const { data: postsData, isLoading, error } = useQuery('dashboardPosts', () => getPosts({ limit: 5 }));

  // Stats cards data
  const stats = [
    {
      name: 'Total Posts',
      value: postsData?.pagination?.total || 0,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Scheduled',
      value: postsData?.posts?.filter(post => post.status === 'scheduled').length || 0,
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Published',
      value: postsData?.posts?.filter(post => post.status === 'published').length || 0,
      icon: CheckIcon,
      color: 'bg-green-500',
    },
  ];

  // Quick actions data
  const quickActions = [
    {
      name: 'Create Post',
      description: 'Create a new post for LinkedIn',
      href: '/posts/create',
      icon: PlusIcon,
      color: 'bg-primary-500',
    },
    {
      name: 'View Scheduled',
      description: 'Manage your scheduled posts',
      href: '/posts/scheduled',
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'View Published',
      description: 'See your published posts',
      href: '/posts/published',
      icon: CheckIcon,
      color: 'bg-green-500',
    },
    {
      name: 'View Drafts',
      description: 'Continue working on drafts',
      href: '/posts/drafts',
      icon: DocumentTextIcon,
      color: 'bg-gray-500',
    },
  ];

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Error loading dashboard</h2>
        <p className="mt-2 text-gray-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to your social media scheduling dashboard
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
            >
              <Link
                to={action.href}
                className="block bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${action.color}`}>
                      <action.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-900">{action.name}</dt>
                        <dd className="text-sm text-gray-500">{action.description}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent posts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Posts</h2>
          <Link
            to="/posts"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View all
          </Link>
        </div>

        {postsData?.posts?.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {postsData.posts.map((post, index) => (
                <motion.li
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                >
                  <Link
                    to={`/posts/edit/${post._id}`}
                    className="block hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="truncate">
                          <div className="flex text-sm">
                            <p className="font-medium text-primary-600 truncate">
                              {post.content.replace(/<[^>]*>?/gm, '').substring(0, 50)}
                              {post.content.length > 50 ? '...' : ''}
                            </p>
                          </div>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  post.status === 'published'
                                    ? 'bg-green-100 text-green-800'
                                    : post.status === 'scheduled'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="text-sm text-gray-500">
                            {new Date(post.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        ) : (
          <EmptyState
            title="No posts yet"
            description="Get started by creating your first post"
            buttonText="Create Post"
            buttonLink="/posts/create"
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
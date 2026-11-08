import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={slug ? `/?category=${encodeURIComponent(slug)}` : '/'} replace />;
};

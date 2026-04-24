import { useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '@cloudscape-design/components/app-layout';
import TopNavigation from '@cloudscape-design/components/top-navigation';
import DashboardLayout    from './pages/DashboardLayout';
import ProgramOverview    from './pages/ProgramOverview';
import PerformanceReviews from './pages/PerformanceReviews';
import FTEConversion      from './pages/FTEConversion';
import './App.css';

export default function App() {
  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <TopNavigation
        identity={{ href: '/', title: 'Junior Developer Program' }}
        search={
          <div className="top-nav-search">
            <button
              type="button"
              className="top-nav-search__icon-button"
              aria-label="Run search"
              onClick={() => searchInputRef.current?.focus()}
            >
              <svg className="top-nav-search__icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.65" y1="16.65" x2="21" y2="21" />
              </svg>
            </button>
            <input
              ref={searchInputRef}
              className="top-nav-search__input"
              type="text"
              placeholder="Search interns, managers..."
              aria-label="Search"
            />
          </div>
        }
        i18nStrings={{ overflowMenuTriggerText: 'More', overflowMenuTitleText: 'All' }}
      />
      <AppLayout
        headerSelector="#h"
        navigationHide
        toolsHide
        content={
          <Routes>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<ProgramOverview />} />
              <Route path="performance-reviews" element={<PerformanceReviews />} />
              <Route path="fte-conversion" element={<FTEConversion />} />
            </Route>
          </Routes>
        }
      />
    </>
  );
}

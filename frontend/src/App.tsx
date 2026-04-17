import { useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '@cloudscape-design/components/app-layout';
import TopNavigation from '@cloudscape-design/components/top-navigation';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import Home from './pages/Home';
import './App.css';

function Navigation() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <SideNavigation
      activeHref={pathname}
      header={{ text: 'My App', href: '/' }}
      onFollow={(e) => {
        e.preventDefault();
        navigate(e.detail.href);
      }}
      items={[{ type: 'link', text: 'Home', href: '/' }]}
    />
  );
}

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
              <svg
                className="top-nav-search__icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
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
        i18nStrings={{
          overflowMenuTriggerText: 'More',
          overflowMenuTitleText: 'All',
        }}
      />
      <AppLayout
        headerSelector="#h"
        navigation={<Navigation />}
        content={
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        }
        toolsHide
      />
    </>
  );
}

import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '@cloudscape-design/components/app-layout';
import TopNavigation from '@cloudscape-design/components/top-navigation';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import Home from './pages/Home';

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
  return (
    <>
      <TopNavigation
        identity={{ href: '/', title: 'My App' }}
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

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <div className={styles.layout}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
      <main className={`${styles.main} ${sidebarCollapsed ? styles.mainCollapsed : ''}`}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

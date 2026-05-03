import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import FacebookMessenger from '../components/common/FacebookMessenger';
import MessengerButton from '../components/common/MessengerButton';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <Footer />
      <FacebookMessenger />
      <MessengerButton />
    </div>
  );
};

export default MainLayout;

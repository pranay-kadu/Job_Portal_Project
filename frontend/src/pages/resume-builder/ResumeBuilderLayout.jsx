import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/Footer';

const ResumeBuilderLayout = () => {
    return (
        <div className='flex flex-col min-h-screen bg-gray-50'>
            <Navbar />
            <div className='flex-grow resume-builder-app'>
                <Outlet />
            </div>
            <Footer />
        </div>
    );
};
export default ResumeBuilderLayout;

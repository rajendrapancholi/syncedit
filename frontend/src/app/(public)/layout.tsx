import Footer from '@/shared/components/Footer';
import Navbar from '@/shared/components/Navbar';

import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: "Home | SyncEdit",
    description: "SyncEdit code Streamer.",
};

export default function FrotLayout({ children }: { children: React.ReactNode; }) {
    return (
        <>
            <Navbar />
            <main className='min-h-[80vh]'>
                {children}
            </main>
            <Footer />
        </>
    );
}

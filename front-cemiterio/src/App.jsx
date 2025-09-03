import React from 'react';
import MainLayout from './layout/MainLayout';
import Footer from './components/Footer';
import { BrowserRouter} from "react-router-dom";
import '../styles.css';
import Dashboard from './components/Dashboard';


export default function App(){
  
  return (
    <BrowserRouter>
    <div className="flex">
      <MainLayout />
      <Footer />
      <main className="flex-1 p-6">
        {/* <AppRoutes /> */}
      </main>
    </div>
    </BrowserRouter>
      );
}


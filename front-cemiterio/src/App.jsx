import React from 'react';
import MainLayout from './layout/mainlayout';
import { BrowserRouter} from "react-router-dom";
import '../styles.css';


export default function App(){
  
  return (
    <BrowserRouter>
    <div className="flex">
      <MainLayout />
      
      <main className="flex-1 p-6">
        {/* <AppRoutes /> */}
      </main>
    </div>
    </BrowserRouter>
      );
}


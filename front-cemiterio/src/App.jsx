import React from 'react';
import { BrowserRouter } from "react-router-dom";
import '../styles.css';
import AppRoutes from './routes';

export default function App() {

  return (
    <BrowserRouter>
      <div className="flex">
        <main className="flex-1 p-6">
          {<AppRoutes />}
        </main>
      </div>
    </BrowserRouter>
  );
}


import React from "react";
import {Routes, Route, Navigate} from "react-router-dom";
import Home from "../pages/Home";
import Cadastros from "../pages/Cadastros";

export default function AppRoutes(){
    return(
        <Routes>
            <Route path='/' element={<Navigate to="/home" />} />
            <Route path='/home' element={<Home />} />
            <Route path='/cadastros' element={<Cadastros />} />
        </Routes>
    );
}
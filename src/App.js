import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Banner from './components/Banner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Store from './pages/Store';
import Blogs from './pages/Blogs';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import PhotoBooth from './pages/PhotoBooth';
import SignUp from './pages/SignUp';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            <>
              <Banner />
              <Navbar />
              <Home />
              <Footer />
            </>
          } />
          <Route path="/about" element={
            <>
              <About />
              <Footer />
            </>
          } />
          <Route path="/store" element={
            <>
              <Banner />
              <Navbar />
              <Store />
              <Footer />
            </>
          } />
          <Route path="/blogs" element={
            <>
              <Banner />
              <Navbar />
              <Blogs />
              <Footer />
            </>
          } />
          <Route path="/contact" element={
            <>
              <Banner />
              <Navbar />
              <Contact />
              <Footer />
            </>
          } />
          <Route path="/faq" element={
            <>
              <Banner />
              <Navbar />
              <FAQ />
              <Footer />
            </>
          } />
          <Route path="/photo-booth" element={
            <>
              <Banner />
              <Navbar />
              <PhotoBooth />
              <Footer />
            </>
          } />
          <Route path="/sign-up" element={
            <>
              <Banner />
              <Navbar />
              <SignUp />
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

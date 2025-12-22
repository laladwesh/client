import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Banner from './components/Banner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import SignUpSidebar from './components/SignUpSidebar';
import Home from './pages/Home';
import About from './pages/About';
import Store from './pages/Store';
import Blogs from './pages/Blogs';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import PhotoBooth from './pages/PhotoBooth';
// SignUp moved to a sidebar (SignUpSidebar)
import Admin from './pages/Admin';
import AdminRoute from './components/AdminRoute';
import './App.css';
import ProductPage from './pages/ProductPage';
import BlogPage from './pages/BlogPage';
import SignUp from './pages/SignUp';


function App() {
  return (
    <Router>
      <div className="App">
        <Toaster position="top-right" containerStyle={{ zIndex: 13000 }} />
        <CartSidebar />
        <SignUpSidebar />
        <Routes>
          <Route path="/" element={
            <>
              <div className="page-content">
                <Banner />
                <Navbar />
                <Home />
              </div>

              <Footer />
            </>
          } />
          <Route path="/product/:productId" element={
            <>
              <div className="page-content">
                <Banner />
                <Navbar />
                <ProductPage />
              </div>

              <Footer />
            </>
          } />
          <Route path="/about" element={
            <>
              <div className="page-content">
                <About />
              </div>
              <Footer />
            </>
          } />
          <Route path="/store" element={
            <>
              <div className="page-content">
                <Banner />
                <Navbar />
                <Store />
              </div>
              <Footer />
            </>
          } />
          <Route path="/blogs" element={
            <>
              <div className="page-content">
                <Banner />
                <Navbar />
                <Blogs />
              </div>
              <Footer />
            </>
          } />
          <Route path="/blog/:blogId" element={
            <>
              <div className="page-content">
                <Banner />
                <Navbar />
                <BlogPage />
              </div>
              <Footer />
            </>
          } />
          <Route path="/contact" element={
            <>
              <div className="page-content">
                <Banner />
                <Navbar />
                <Contact />
              </div>
              <Footer />
            </>
          } />
          <Route path="/faq" element={
            <>
              <div className="page-content">
                <Banner />
                <Navbar />
                <FAQ />
              </div>
              <Footer />
            </>
          } />
          <Route path="/photo-booth" element={
            <>
              <div className="page-content">
                <Banner />
                <Navbar />
                <PhotoBooth />
              </div>
              <Footer />
            </>
          } />

<Route path="/sign-up" element={
            <>
              <div className="page-content">
                <Banner />
                <Navbar />
                <SignUp />
              </div>
              <Footer />
            </>
          } />          {/* Sign-up is now a sidebar — route removed */}
          <Route path="/admin" element={
            <>
              <div className="">
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              </div>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

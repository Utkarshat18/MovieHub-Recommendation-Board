
import React from 'react'
import { AuthProvider } from './components/context/AuthContext'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar'
import Login from './components/Login/Login';
// import Homepage from './components/Homepage/Homepage';
// import Homepage from './components/Homepage/Homepage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              {/* <Route path="/" element={<Homepage />} /> */}
              <Route path="/login" element={<Login />} />
              {/* <Route path="/register" element={<Register />} /> */}
              {/* <Route path="/movie/:id" element={<MovieDetail />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              /> */}
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

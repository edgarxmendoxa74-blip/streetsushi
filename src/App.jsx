import React from 'react';
import Navbar from './components/Navbar';
import Menu from './components/Menu';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main>
        <Menu />
      </main>
      <Footer />
    </div>
  );
}

export default App;

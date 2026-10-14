import { Route, Routes } from 'react-router-dom';
import { Header } from './components/common/Header';
import { Home } from './pages/Home';
import { History } from './pages/History';
import { About } from './pages/About';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <div className="container">
        <footer className="site-footer">Docket — AI-assisted, not a substitute for editorial judgment.</footer>
      </div>
    </>
  );
}

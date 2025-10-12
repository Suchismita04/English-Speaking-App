import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Calling from '../pages/Calling';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/connect" element={<Calling />} />
    </Routes>
  );
};

export default AppRoutes;

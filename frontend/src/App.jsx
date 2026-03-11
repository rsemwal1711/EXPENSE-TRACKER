import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ExpenseTracker from './pages/ExpenseTracker';
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element = {<Dashboard />} />
        <Route path="/signup" element = {<Signup />} />
        <Route path="/login" element = {<Login />} />
        <Route path="/expense-tracker" element={<ExpenseTracker />} />
      </Routes>


    </BrowserRouter>
  )
}

export default App;
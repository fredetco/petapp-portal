import { BrowserRouter, Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-4">&#x1F3E5;</div>
                <h1 className="text-2xl font-extrabold text-portal-primary-700 mb-2">
                  PetApp Business Portal
                </h1>
                <p className="text-neutral-500">
                  For veterinarians, groomers, and trainers.
                </p>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

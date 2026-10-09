import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import SellItem from "./pages/SellItem";
import MyListings from "./pages/MyListings";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SavedItems from "./pages/SavedItems";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Profile from "./pages/Profile";

function App() {
    return (
        <AuthProvider>

            <BrowserRouter>

                <Navbar />

                <Routes>

                    {/* Public pages */}
                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/product/:id"
                        element={<ProductDetails />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    {/* Protected pages */}
                    <Route
                        path="/sell"
                        element={
                            <ProtectedRoute>
                                <SellItem />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/my-listings"
                        element={
                            <ProtectedRoute>
                                <MyListings />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/saved-items"
                        element={
                            <ProtectedRoute>
                                <SavedItems />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                          path="/profile"
                          element={
                              <ProtectedRoute>
                                  <Profile />
                              </ProtectedRoute>
                          }
                      />

                </Routes>

            </BrowserRouter>

        </AuthProvider>
    );
}

export default App;
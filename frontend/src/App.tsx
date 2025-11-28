import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, Spinner } from '@chakra-ui/react';
import { Register } from './pages/register/Register';
import { Recipes } from './pages/recipes/Recipes';
import { RecipeDetails } from './pages/recipeDetails/RecipeDetails';
import { UserIngredients } from './pages/userIngredients/UserIngredients';
import { localStorageUtils } from './utils/localStorage';
import { useUser } from './hooks/useUser';

function InitialRoute() {
  const [userEmail] = useState(() => localStorageUtils.getUserEmail());
  const { user, loading, fetchUserByEmail, error } = useUser();

  useEffect(() => {
    if (userEmail) {
      fetchUserByEmail(userEmail);
    }
  }, [userEmail, fetchUserByEmail]);

  if (!userEmail) {
    return <Navigate to="/register" replace />;
  }

  if (loading || (!user && !error)) {
    return (
      <Container centerContent>
        <Spinner size="xl" mt={8} />
      </Container>
    );
  }

  if (error || !user) {
    localStorageUtils.setUserEmail('');
    return <Navigate to="/register" replace />;
  }

  return <Navigate to={`/users/${user.id}/recipes`} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<InitialRoute />} />
      <Route path="/register" element={<Register />} />
      <Route path="/users/:userId/recipes" element={<Recipes />} />
      <Route path="/users/:userId/recipes/:recipeId" element={<RecipeDetails />} />
      <Route path="/users/:userId/user-ingredients" element={<UserIngredients />} />
    </Routes>
  );
}

export default App;

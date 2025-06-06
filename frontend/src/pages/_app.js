import '../styles/globals.css';
import Navigation from '../components/Navigation';
import { UnitProvider } from '../context/UnitContext';
import { PlanProvider } from '../context/PlanContext';
import { AuthProvider } from '../context/AuthContext';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <UnitProvider>
        <PlanProvider>
          <Navigation />
          <Component {...pageProps} />
        </PlanProvider>
      </UnitProvider>
    </AuthProvider>
  );
}

export default MyApp; 
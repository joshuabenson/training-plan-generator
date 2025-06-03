import '../styles/globals.css';
import Navigation from '../components/Navigation';
import { UnitProvider } from '../context/UnitContext';
import { PlanProvider } from '../context/PlanContext';

function MyApp({ Component, pageProps }) {
  return (
    <UnitProvider>
      <PlanProvider>
        <Navigation />
        <Component {...pageProps} />
      </PlanProvider>
    </UnitProvider>
  );
}

export default MyApp; 
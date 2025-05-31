import '../styles/globals.css';
import Navigation from '../components/Navigation';
import { UnitProvider } from '../context/UnitContext';

function MyApp({ Component, pageProps }) {
  return (
    <UnitProvider>
      <Navigation />
      <Component {...pageProps} />
    </UnitProvider>
  );
}

export default MyApp; 
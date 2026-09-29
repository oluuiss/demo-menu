import Hero from '../components/home/Hero.jsx';
import Highlights from '../components/home/Highlights.jsx';
import Experience from '../components/home/Experience.jsx';
import LocationsTeaser from '../components/home/LocationsTeaser.jsx';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Highlights />
      <Experience />
      <LocationsTeaser />
    </>
  );
}

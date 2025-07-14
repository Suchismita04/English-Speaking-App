import About from '../components/landing/About';
import Contact from '../components/landing/Contact';
import Courses from '../components/landing/Courses';
import Features from '../components/landing/Features';
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/How_it_works';
import Testimonials from '../components/landing/Testimonials';

const Home = () => {
  return (
    <>
      <Hero />
      <About/>
      <Features/>
      <HowItWorks />
      <Courses />
      <Testimonials />
      <Contact />
    </>
  );
};

export default Home;

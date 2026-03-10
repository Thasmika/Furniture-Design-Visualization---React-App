import { useRef } from 'react';
import { useIntersectionObserver } from '../../hooks';
import { OptimizedImage } from './OptimizedImage';
import './AboutSection.css';

export const AboutSection = () => {
  const ref = useRef<HTMLElement>(null);
  const isVisible = useIntersectionObserver(ref as React.RefObject<Element>, { threshold: 0.2 });

  return (
    <section 
      ref={ref} 
      className={`about-section ${isVisible ? 'fade-in' : ''}`}
      id="about"
      aria-labelledby="about-heading"
    >
      <div className="about-container">
        <div className="about-content">
          <h2 id="about-heading">About FurniVision</h2>
          <p>
            FurniVision was born from a simple observation: planning room layouts and furniture 
            arrangements shouldn't require expensive software or professional design skills. 
            Whether you're moving into a new home, redecorating a room, or simply exploring 
            different furniture arrangements, our tool makes the process intuitive and enjoyable.
          </p>
          <p>
            Our platform combines powerful 2D and 3D visualization technology with an extensive 
            furniture library, giving you the freedom to experiment with countless design 
            possibilities. See your ideas come to life instantly, make changes on the fly, and 
            save your favorite designs for future reference. With FurniVision, you can confidently 
            plan your space before making any purchases or moving a single piece of furniture.
          </p>
          <p>
            Join thousands of homeowners, renters, and interior design enthusiasts who trust 
            FurniVision to transform their spaces from concept to reality.
          </p>
        </div>
        <div className="about-visual">
          <OptimizedImage
            src="/about-illustration.svg" 
            alt="Person using FurniVision to design a room layout on a computer, showing both 2D floor plan and 3D visualization"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

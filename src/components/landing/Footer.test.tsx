import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Footer } from './Footer';

const renderFooter = (isAuthenticated: boolean = false) => {
  return render(
    <BrowserRouter>
      <Footer isAuthenticated={isAuthenticated} />
    </BrowserRouter>
  );
};

describe('Footer Component', () => {
  describe('Requirement 21.1: Logo and Tagline', () => {
    test('displays FurniVision logo', () => {
      renderFooter();
      expect(screen.getByText('FurniVision')).toBeInTheDocument();
    });

    test('displays logo icon', () => {
      renderFooter();
      const logoIcon = screen.getByText('🪑');
      expect(logoIcon).toBeInTheDocument();
      expect(logoIcon).toHaveClass('footer-logo-icon');
    });

    test('displays tagline', () => {
      renderFooter();
      expect(
        screen.getByText('Professional 2D/3D furniture visualization tool')
      ).toBeInTheDocument();
    });
  });

  describe('Requirement 21.2: Navigation Links', () => {
    test('displays Contact link', () => {
      renderFooter();
      const contactLink = screen.getByRole('link', { name: /contact/i });
      expect(contactLink).toBeInTheDocument();
      expect(contactLink).toHaveAttribute('href', '/contact');
    });

    test('displays Reviews link', () => {
      renderFooter();
      const reviewsLink = screen.getByRole('link', { name: /reviews/i });
      expect(reviewsLink).toBeInTheDocument();
      expect(reviewsLink).toHaveAttribute('href', '/reviews');
    });

    test('displays Profile link when authenticated', () => {
      renderFooter(true);
      const profileLink = screen.getByRole('link', { name: /profile/i });
      expect(profileLink).toBeInTheDocument();
      expect(profileLink).toHaveAttribute('href', '/profile');
    });

    test('does not display Profile link when unauthenticated', () => {
      renderFooter(false);
      const profileLink = screen.queryByRole('link', { name: /profile/i });
      expect(profileLink).not.toBeInTheDocument();
    });

    test('displays Quick Links heading', () => {
      renderFooter();
      expect(screen.getByText('Quick Links')).toBeInTheDocument();
    });
  });

  describe('Requirement 21.3: Copyright Information', () => {
    test('displays copyright text', () => {
      renderFooter();
      expect(
        screen.getByText('© 2026 FurniVision Inc. All rights reserved.')
      ).toBeInTheDocument();
    });

    test('copyright is in footer bottom section', () => {
      renderFooter();
      const copyright = screen.getByText(
        '© 2026 FurniVision Inc. All rights reserved.'
      );
      expect(copyright).toHaveClass('footer-copyright');
    });
  });

  describe('Requirement 21.4: Social Media Links', () => {
    test('displays Instagram link', () => {
      renderFooter();
      const instagramLink = screen.getByRole('link', {
        name: /follow us on instagram/i,
      });
      expect(instagramLink).toBeInTheDocument();
      expect(instagramLink).toHaveAttribute(
        'href',
        'https://instagram.com/furnivision'
      );
      expect(instagramLink).toHaveAttribute('target', '_blank');
      expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('displays TikTok link', () => {
      renderFooter();
      const tiktokLink = screen.getByRole('link', {
        name: /follow us on tiktok/i,
      });
      expect(tiktokLink).toBeInTheDocument();
      expect(tiktokLink).toHaveAttribute(
        'href',
        'https://tiktok.com/@furnivision'
      );
      expect(tiktokLink).toHaveAttribute('target', '_blank');
      expect(tiktokLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('displays YouTube link', () => {
      renderFooter();
      const youtubeLink = screen.getByRole('link', {
        name: /subscribe on youtube/i,
      });
      expect(youtubeLink).toBeInTheDocument();
      expect(youtubeLink).toHaveAttribute(
        'href',
        'https://youtube.com/@furnivision'
      );
      expect(youtubeLink).toHaveAttribute('target', '_blank');
      expect(youtubeLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('displays Follow Us heading', () => {
      renderFooter();
      expect(screen.getByText('Follow Us')).toBeInTheDocument();
    });

    test('social media links have visible text', () => {
      renderFooter();
      expect(screen.getByText('Instagram')).toBeInTheDocument();
      expect(screen.getByText('TikTok')).toBeInTheDocument();
      expect(screen.getByText('YouTube')).toBeInTheDocument();
    });
  });

  describe('Requirement 21.5: Distinct Background Color', () => {
    test('footer has background element', () => {
      const { container } = renderFooter();
      const background = container.querySelector('.footer-background');
      expect(background).toBeInTheDocument();
      expect(background).toHaveAttribute('aria-hidden', 'true');
    });

    test('footer has footer class for styling', () => {
      const { container } = renderFooter();
      const footer = container.querySelector('.footer');
      expect(footer).toBeInTheDocument();
    });
  });

  describe('Requirement 21.6: Accessibility and Responsive Design', () => {
    test('uses semantic footer element', () => {
      const { container } = renderFooter();
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    test('footer has aria-label', () => {
      renderFooter();
      const footer = screen.getByRole('contentinfo', { name: /site footer/i });
      expect(footer).toBeInTheDocument();
    });

    test('navigation has aria-label', () => {
      renderFooter();
      const nav = screen.getByRole('navigation', {
        name: /footer navigation/i,
      });
      expect(nav).toBeInTheDocument();
    });

    test('social media links have aria-labels', () => {
      renderFooter();
      expect(
        screen.getByRole('link', { name: /follow us on instagram/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /follow us on tiktok/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /subscribe on youtube/i })
      ).toBeInTheDocument();
    });

    test('decorative icons have aria-hidden', () => {
      const { container } = renderFooter();
      const logoIcon = container.querySelector('.footer-logo-icon');
      const socialIcons = container.querySelectorAll('.footer-social-icon');

      expect(logoIcon).toHaveAttribute('aria-hidden', 'true');
      socialIcons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    test('footer content is structured with sections', () => {
      const { container } = renderFooter();
      const sections = container.querySelectorAll('.footer-section');
      expect(sections.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Component Structure', () => {
    test('renders all main sections', () => {
      const { container } = renderFooter();
      expect(container.querySelector('.footer-brand')).toBeInTheDocument();
      expect(container.querySelector('.footer-links')).toBeInTheDocument();
      expect(container.querySelector('.footer-social')).toBeInTheDocument();
      expect(container.querySelector('.footer-bottom')).toBeInTheDocument();
    });

    test('footer content is properly structured', () => {
      const { container } = renderFooter();
      const footerContent = container.querySelector('.footer-content');
      expect(footerContent).toBeInTheDocument();
      expect(footerContent?.children.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Conditional Rendering', () => {
    test('authenticated state shows Profile link', () => {
      renderFooter(true);
      expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
    });

    test('unauthenticated state hides Profile link', () => {
      renderFooter(false);
      expect(
        screen.queryByRole('link', { name: /profile/i })
      ).not.toBeInTheDocument();
    });

    test('Contact and Reviews links visible when unauthenticated', () => {
      renderFooter(false);
      expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /reviews/i })).toBeInTheDocument();
    });

    test('Contact and Reviews links visible when authenticated', () => {
      renderFooter(true);
      expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /reviews/i })).toBeInTheDocument();
    });
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from './Tooltip';
import { describe, it, expect } from 'vitest';

describe('Tooltip', () => {
  it('should render children without tooltip initially', () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );

    expect(screen.getByText('Hover me')).toBeInTheDocument();
    expect(screen.queryByText('Test tooltip')).not.toBeInTheDocument();
  });

  it('should show tooltip on hover after delay', async () => {
    render(
      <Tooltip content="Test tooltip" delay={100}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    await userEvent.hover(button);

    // Tooltip should appear after delay
    await waitFor(
      () => {
        expect(screen.getByText('Test tooltip')).toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('should hide tooltip on mouse leave', async () => {
    render(
      <Tooltip content="Test tooltip" delay={100}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    await userEvent.hover(button);

    await waitFor(
      () => {
        expect(screen.getByText('Test tooltip')).toBeInTheDocument();
      },
      { timeout: 500 }
    );

    await userEvent.unhover(button);

    await waitFor(
      () => {
        expect(screen.queryByText('Test tooltip')).not.toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('should display keyboard shortcut when provided', async () => {
    render(
      <Tooltip content="Save design" shortcut="Ctrl+S" delay={100}>
        <button>Save</button>
      </Tooltip>
    );

    const button = screen.getByText('Save');
    await userEvent.hover(button);

    await waitFor(
      () => {
        expect(screen.getByText('Save design')).toBeInTheDocument();
        expect(screen.getByText('Ctrl+S')).toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('should render tooltip with correct position class', async () => {
    const { container } = render(
      <Tooltip content="Test tooltip" position="bottom" delay={100}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    await userEvent.hover(button);

    await waitFor(
      () => {
        const tooltip = container.querySelector('.tooltip-bottom');
        expect(tooltip).toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('should have descriptive content', async () => {
    const descriptiveContent = 'Click to add a new chair to your design';

    render(
      <Tooltip content={descriptiveContent} delay={100}>
        <button>Add Chair</button>
      </Tooltip>
    );

    const button = screen.getByText('Add Chair');
    await userEvent.hover(button);

    await waitFor(
      () => {
        expect(screen.getByText(descriptiveContent)).toBeInTheDocument();
      },
      { timeout: 500 }
    );

    // Verify content is descriptive (more than just a word)
    expect(descriptiveContent.split(' ').length).toBeGreaterThan(3);
  });

  it('should support different positions', async () => {
    const positions: Array<'top' | 'bottom' | 'left' | 'right'> = [
      'top',
      'bottom',
      'left',
      'right',
    ];

    for (const position of positions) {
      const { container, unmount } = render(
        <Tooltip content="Test" position={position} delay={100}>
          <button>Test {position}</button>
        </Tooltip>
      );

      const button = screen.getByText(`Test ${position}`);
      await userEvent.hover(button);

      await waitFor(
        () => {
          const tooltip = container.querySelector(`.tooltip-${position}`);
          expect(tooltip).toBeInTheDocument();
        },
        { timeout: 500 }
      );

      unmount();
    }
  });
});

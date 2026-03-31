import { useState, useCallback } from 'react';
import { Joyride, type CallBackProps, type Step, STATUS, ACTIONS } from 'react-joyride';

const tourButtons = ['skip', 'close', 'primary'] as const;

const steps: Step[] = [
  {
    target: '[data-tour="record-button"]',
    title: 'Record Your Screen',
    content:
      'Capture your screen and voice to demonstrate new workflow steps. AI will interpret your recording and propose changes.',
    placement: 'bottom',
    disableBeacon: true,
    buttons: [...tourButtons],
  },
  {
    target: '.react-flow__node:first-child',
    title: 'Edit a Node',
    content:
      'Click any node to edit its name, description, and config. You can also delete nodes or insert new steps between existing ones.',
    placement: 'right',
    disableBeacon: true,
    buttons: [...tourButtons],
  },
  {
    target: 'main',
    title: 'Review Proposed Changes',
    content:
      'After recording or editing, changes appear on the canvas with color coded labels. Use the toolbar to view, compare, and commit your changes.',
    placement: 'center',
    disableBeacon: true,
    buttons: [...tourButtons],
  },
  {
    target: '[data-history-toggle]',
    title: 'Version History',
    content:
      'Browse past commits and click any version to preview it or compare side by side.',
    placement: 'bottom-end',
    disableBeacon: true,
    buttons: [...tourButtons],
  },
];

const SOLA_BLUE = '#3b5bdb';

export function GuidedTour() {
  const [run, setRun] = useState(true);

  const handleCallback = useCallback((data: CallBackProps) => {
    const { status, action } = data;
    if (
      status === STATUS.FINISHED ||
      status === STATUS.SKIPPED ||
      action === ACTIONS.CLOSE
    ) {
      setRun(false);
    }
  }, []);

  return (
    <Joyride
      steps={steps}
      run={run}
      callback={handleCallback}
      continuous
      disableOverlayClose
      spotlightPadding={8}
      locale={{
        close: 'Got it',
        last: 'Get Started',
        next: 'Next',
        skip: 'Skip',
      }}
      styles={{
        options: {
          arrowColor: '#ffffff',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.45)',
          primaryColor: SOLA_BLUE,
          textColor: '#1a1d27',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          padding: '24px',
          maxWidth: 380,
        },
        tooltipTitle: {
          fontSize: '16px',
          fontWeight: 700,
          marginBottom: '8px',
          color: '#1a1d27',
        },
        tooltipContent: {
          fontSize: '13.5px',
          lineHeight: '1.6',
          color: '#3a3f4b',
          padding: '8px 0 16px',
        },
        buttonNext: {
          backgroundColor: SOLA_BLUE,
          color: '#ffffff',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          padding: '8px 20px',
          outline: 'none',
        },
        buttonBack: {
          color: SOLA_BLUE,
          fontSize: '13px',
          fontWeight: 500,
          marginRight: '8px',
        },
        buttonSkip: {
          color: SOLA_BLUE,
          fontSize: '12px',
          fontWeight: 500,
          opacity: 0.6,
        },
        buttonClose: {
          top: 12,
          right: 12,
        },
        spotlight: {
          borderRadius: '10px',
        },
        overlay: {
          transition: 'background-color 0.3s ease',
        },
      }}
    />
  );
}

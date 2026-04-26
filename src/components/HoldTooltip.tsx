import React, { useState, useRef, useEffect } from 'react';
import { IonPopover, IonText } from '@ionic/react';

interface HoldTooltipProps {
  text: string;
  children: React.ReactNode;
  delay?: number;
}

const HoldTooltip: React.FC<HoldTooltipProps> = ({ text, children, delay = 500 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startPress = (e: any) => {
    // Prevent default context menu on long press
    e.persist && e.persist();
    timerRef.current = setTimeout(() => {
      setEvent(e);
      setIsOpen(true);
    }, delay);
  };

  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsOpen(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <>
      <div 
        onMouseDown={startPress}
        onMouseUp={cancelPress}
        onMouseLeave={cancelPress}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onContextMenu={(e) => e.preventDefault()}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      <IonPopover
        isOpen={isOpen}
        event={event}
        onDidDismiss={() => setIsOpen(false)}
        side="top"
        alignment="center"
        keyboardClose={false}
        showBackdrop={false}
        className="tooltip-popover"
      >
        <div className="ion-padding" style={{ fontSize: '0.85rem' }}>
          <IonText color="dark">{text}</IonText>
        </div>
      </IonPopover>
    </>
  );
};

export default HoldTooltip;

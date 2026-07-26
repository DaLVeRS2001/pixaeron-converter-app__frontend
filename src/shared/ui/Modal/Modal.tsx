import block from 'bem-cn';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { getOrCreateNodeById } from 'shared/lib/dom';

import { Button } from '../Button';

import './Modal.scss';

const MODAL_ROOT_ID = 'modal-root';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const cn = block('modal');

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const Content = (
    <div className={cn()} onClick={handleOverlayClick}>
      <div className={cn('content')}>
        <Button
          type="button"
          className={cn('close')}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          ×
        </Button>
        {children}
      </div>
    </div>
  );

  return createPortal(Content, getOrCreateNodeById(MODAL_ROOT_ID));
};

export { Modal };

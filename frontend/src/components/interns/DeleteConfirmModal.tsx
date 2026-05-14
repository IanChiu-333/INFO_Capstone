import Modal from '@cloudscape-design/components/modal';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Alert from '@cloudscape-design/components/alert';
import type { Intern } from '../../services';

interface Props {
  items: Intern[];
  onConfirm: () => void;
  onDismiss: () => void;
}

export default function DeleteConfirmModal({ items, onConfirm, onDismiss }: Props) {
  const message =
    items.length === 1
      ? <>Are you sure you want to delete <strong>{items[0].internName}</strong>? This action cannot be undone.</>
      : <>Are you sure you want to delete <strong>{items.length} interns</strong>? This action cannot be undone.</>;

  return (
    <Modal
      visible
      onDismiss={onDismiss}
      header={items.length === 1 ? 'Delete intern' : `Delete ${items.length} interns`}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button onClick={onDismiss}>Cancel</Button>
            <Button variant="primary" onClick={onConfirm}>Delete</Button>
          </SpaceBetween>
        </Box>
      }
    >
      <Alert type="warning">{message}</Alert>
    </Modal>
  );
}

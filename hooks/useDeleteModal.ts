import { useState } from 'react';
import { useDeleteDream } from './useDreams';

export const useDeleteModal = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const deleteDreamMutation = useDeleteDream();

  const openDeleteModal = (id: string) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setItemToDelete(null);
    setShowDeleteModal(false);
  };

  const confirmDelete = (onSuccess?: () => void) => {
    if (itemToDelete) {
      deleteDreamMutation.mutate(itemToDelete, {
        onSuccess: () => {
          closeDeleteModal();
          onSuccess?.();
        },
        onError: (error) => {
          console.error('Failed to delete dream:', error);
          closeDeleteModal();
        },
      });
    }
  };

  return {
    showDeleteModal,
    itemToDelete,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    isDeleting: deleteDreamMutation.isPending,
  };
};
'use client';

import styles from '../ModalComponent.module.css';
import ownStyles from './EditRole.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import UserRoles, { UserFunction } from '../UserRoles/UserRoles';
import { useRolesStore, Role } from '@/store/rolesStore';
import ModalComponent from '../ModalComponent';
import { PaginationState } from '@/types/componentsTypes';

interface FormData {
  name: string;
  description: string;
}

interface EditRoleProps {
  onClose: () => void;
  role: Role;
  pagination: PaginationState;
}

export default function EditRole({ onClose, role, pagination }: EditRoleProps) {
  const t = useTranslations('');
  const { editRole, fetchRoles, loading } = useRolesStore();

  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [roleFunctions, setRoleFunctions] = useState<UserFunction[]>(
    role.functions.map(f => ({
      function_id: f.function_id,
      operations: f.operations,
      subcategories: f.subcategories || [],
    }))
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: role.name,
      description: role.description || '',
    },
  });

  const onSubmit: SubmitHandler<FormData> = async data => {
    const roleData = {
      role_id: role.role_id,
      name: data.name,
      description: data.description,
      functions: roleFunctions.map(func => ({
        function_id: func.function_id,
        operations: func.operations,
        subcategories: func.subcategories,
      })),
    };

    try {
      await editRole(roleData);
      toast.success(
        t('RoleSection.modalEdit.successMessage') || 'Role updated successfully'
      );
      await fetchRoles({
        limit: pagination.pageSize,
        offset: pagination.pageIndex,
      });
      onClose();
    } catch {
      toast.error(
        t('RoleSection.modalEdit.errorMessage') || 'Failed to update role'
      );
    }
  };

  const handleRolesSubmit = (functions: UserFunction[]) => {
    setRoleFunctions(functions);
    setIsRolesModalOpen(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggleRolesModal = () => setIsRolesModalOpen(!isRolesModalOpen);

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`${styles.form} ${ownStyles.form}`}
      >
        <div className={styles.field}>
          <label className={styles.label}>
            {t('RoleSection.modalCreate.name')}
          </label>
          <input
            className={`${styles.input} ${
              errors.name ? styles.input_error : ''
            }`}
            {...register('name', {
              required: t('DBSettings.form.errorMessage'),
            })}
          />
          {errors.name && <p className={styles.error}>{errors.name.message}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            {t('RoleSection.modalCreate.description')}
          </label>
          <input
            className={`${styles.input} ${
              errors.description ? styles.input_error : ''
            }`}
            {...register('description', {
              required: t('DBSettings.form.errorMessage'),
            })}
          />
          {errors.description && (
            <p className={styles.error}>{errors.description.message}</p>
          )}
        </div>
        <div className={`${styles.field} ${ownStyles.fieldBottom}`}>
          <WhiteBtn
            onClick={toggleRolesModal}
            text={'RoleSection.modalCreate.rolesBtn'}
            icon="icon-settings-btn"
          />
        </div>
        <div className={styles.buttons_wrap}>
          <CancelBtn text="DBSettings.form.cancelBtn" onClick={handleClose} />
          <SubmitBtn
            text={
              loading
                ? 'RoleSection.modalEdit.load'
                : 'RoleSection.modalEdit.updateBtn'
            }
            disabled={loading}
          />
        </div>
      </form>

      <ModalComponent
        isOpen={isRolesModalOpen}
        onClose={toggleRolesModal}
        title="RoleSection.modalRoles.title"
      >
        <UserRoles
          onRolesSubmit={handleRolesSubmit}
          initialFunctions={roleFunctions}
        />
      </ModalComponent>
    </>
  );
}

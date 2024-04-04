import React from "react";
import styles from "./Modal.module.css";
import type { OperateType } from "../types/Notes";

interface ModalProps {
  isOpen: boolean;
  operate: OperateType;
  onClose: () => void;
  onConfirm: () => void;
  width: string;
  height: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  operate,
  onClose,
  onConfirm,
  width,
  height,
}) => {
  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    isOpen && (
      <div className={styles.modal_overlay} onClick={handleClose}>
        <div
          className={styles.modal_content}
          style={{ width: `${width}`, height: `${height}` }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className={styles.close_button} onClick={handleClose}>
            ×
          </button>
          <div className={styles.modal_body}>
            确定要{operate === "delete" ? "删除" : "保存"}吗?
          </div>
          <div className={styles.button_container}>
            <button
              className={`${styles.confirm_button} ${styles[`${operate}`]}`}
              onClick={handleConfirm}
            >
              确认
            </button>
            <button className={styles.cancel_button} onClick={handleClose}>
              取消
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default Modal;

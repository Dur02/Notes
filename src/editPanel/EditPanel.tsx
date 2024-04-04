import React, { useEffect, useState, useCallback } from "react";
import styles from "./EditPanel.module.css";
import type { NotesType, OperateDataType, OperateType } from "../types/Notes";

interface EditPanelProps {
  activeNote: NotesType | null;
  setActiveNote: (note: NotesType) => void;
  onNoteEdit: (title: string, body: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  setOperate: (operate: OperateType) => void;
  setOperateData: (operateData: OperateDataType) => void;
}

const EditPanel: React.FC<EditPanelProps> = ({
  activeNote,
  setIsOpen,
  setOperate,
  setOperateData,
}) => {
  const [inputValue, setInputValue] = useState(activeNote?.title || "");
  const [textAreaValue, setTextAreaValue] = useState(activeNote?.body || "");

  const handleDeleteModalOpen = useCallback(
    (noteId: number) => {
      // if noteId exist and the note has been change, open Modal
      // if cancel edit, is it need to change back the origin note content?
      if (
        noteId &&
        (inputValue !== activeNote?.title || textAreaValue !== activeNote?.body)
      ) {
        setOperate("edit");
        setIsOpen(true);
        setOperateData({
          title: inputValue,
          body: textAreaValue,
        });
      }
    },
    [inputValue, textAreaValue, activeNote]
  );

  useEffect(() => {
    setInputValue(activeNote?.title || "");
    setTextAreaValue(activeNote?.body || "");
  }, [activeNote]);

  return (
    <>
      <div
        className={styles.notes__preview}
        onBlur={() => handleDeleteModalOpen(activeNote!.id)}
      >
        <input
          className={styles.notes__title}
          type="text"
          placeholder="新笔记..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <textarea
          className={styles.notes__body}
          value={textAreaValue}
          onChange={(e) => setTextAreaValue(e.target.value)}
        />
      </div>
    </>
  );
};

export default EditPanel;

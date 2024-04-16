import React, { useCallback, useEffect, useState, useRef } from "react";
import NotesAPI from "./api";
import EditPanel from "./editPanel/EditPanel";
import Siderbar from "./sidebar/Sidebar";
import Modal from "./modal/Modal";
import type { NotesType, OperateType, OperateDataType } from "./types/Notes";

const App: React.FC<{}> = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [notes, setNotes] = useState<NotesType[]>([]);
  const [activeNote, setActiveNote] = useState<NotesType | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [operate, setOperate] = useState<OperateType>("delete");
  const [operateData, setOperateData] = useState<OperateDataType>({});

  const refreshNotes = useCallback(() => {
    const notes = NotesAPI.getAllNotes();
    setNotes(notes);
    if (notes.length > 0) {
      setActiveNote(notes[0]);
    }
  }, []);

  const scrollToTop = () => {
    const scrollToTopAnimation = () => {
      if (scrollRef.current) {
        const currentScrollTop = scrollRef.current.scrollTop;
        if (currentScrollTop > 0) {
          // setting the step of scroll
          const step = Math.max(1, currentScrollTop / 20);
          // update scroll position
          scrollRef.current.scrollTop -= step;
          requestAnimationFrame(scrollToTopAnimation);
        }
      }
    };

    scrollToTopAnimation();
  };

  const onNoteSelect = useCallback(
    (noteId: number) => {
      const selectedNote = notes.find((note) => note.id === noteId);
      setActiveNote(selectedNote || null);
    },
    [notes]
  );

  const onNoteAdd = useCallback(() => {
    const newNote = {
      id: -1,
      title: "新建笔记2233",
      body: "开始记录...",
      updated: "",
    };

    NotesAPI.saveNote(newNote);
    refreshNotes();
    scrollToTop();
  }, []);

  const onNoteEdit = useCallback(
    (title: string, body: string) => {
      NotesAPI.saveNote({
        id: activeNote!.id,
        title,
        body,
        updated: "",
      });

      handleModalClose();
      refreshNotes();
    },
    [activeNote, operateData]
  );

  const onNoteDelete = useCallback(
    (noteId: number) => {
      NotesAPI.deleteNote(noteId);
      handleModalClose();
      refreshNotes();
      scrollToTop();
    },
    [operateData]
  );

  const handleModalClose = useCallback(() => {
    setIsOpen(false);
    setOperateData({});
  }, []);

  useEffect(() => {
    refreshNotes();
  }, []);

  return (
    <div className="notes">
      <Siderbar
        scrollRef={scrollRef}
        notes={notes}
        activeNote={activeNote!}
        setIsOpen={setIsOpen}
        setOperate={setOperate}
        setOperateData={setOperateData}
        onNoteSelect={onNoteSelect}
        onNoteAdd={onNoteAdd}
        onNoteEdit={onNoteEdit}
        onNoteDelete={onNoteDelete}
        refreshNotes={refreshNotes}
      />
      <EditPanel
        activeNote={activeNote}
        setActiveNote={setActiveNote}
        onNoteEdit={onNoteEdit}
        setIsOpen={setIsOpen}
        setOperate={setOperate}
        setOperateData={setOperateData}
      />
      <Modal
        isOpen={isOpen}
        operate={operate}
        onClose={() => handleModalClose()}
        onConfirm={() =>
          operate === "delete"
            ? onNoteDelete(operateData.id!)
            : onNoteEdit(operateData.title!, operateData.body!)
        }
        width="300px"
        height="100px"
      />
    </div>
  );
};

export default App;

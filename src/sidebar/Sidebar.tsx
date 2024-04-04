import React, { useCallback, useRef } from "react";
import NotesAPI from "../api";
import type { ChangeEvent, MutableRefObject } from "react";
import type { NotesType, OperateDataType, OperateType } from "../types/Notes";
import styles from "./Sidebar.module.css";

interface SiderbarProps {
  scrollRef: MutableRefObject<HTMLDivElement | null>;
  notes: NotesType[];
  activeNote: NotesType | null;
  setIsOpen: (isOpen: boolean) => void;
  setOperate: (operate: OperateType) => void;
  setOperateData: (operateData: OperateDataType) => void;
  onNoteSelect: (noteId: number) => void;
  onNoteAdd: () => void;
  onNoteEdit: (title: string, body: string) => void;
  onNoteDelete: (noteId: number) => void;
  refreshNotes: () => void;
}

const Siderbar: React.FC<SiderbarProps> = ({
  scrollRef,
  notes,
  activeNote,
  setIsOpen,
  setOperate,
  setOperateData,
  onNoteSelect,
  onNoteAdd,
  refreshNotes,
}) => {
  const MAX_TITLE_LENGTH = 10;
  const MAX_BODY_LENGTH = 60;

  const uploadRef = useRef<HTMLInputElement | null>(null);

  const handleDeleteModalOpen = useCallback((noteId: number) => {
    setOperate("delete");
    setIsOpen(true);
    setOperateData({ id: noteId });
  }, []);

  const downloadCsvFromJson = useCallback((jsonData: NotesType[]) => {
    const csvData = jsonToCsv(jsonData);
    const xmlData = jsonToXml(jsonData);

    const blob1 = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const blob2 = new Blob([xmlData], { type: "text/xml;charset=utf-8;" });

    const url1 = URL.createObjectURL(blob1);
    const url2 = URL.createObjectURL(blob2);

    const link = document.createElement("a");

    link.href = url1;
    link.setAttribute("download", "文件下载.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    link.href = url2;
    link.setAttribute("download", "文件下载.xml");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url1);
  }, []);

  const jsonToCsv = useCallback((jsonData: NotesType[]) => {
    // Extract all keys from JSON data
    const headers: string[] = Object.keys(jsonData[0]);

    // Convert keys array to CSV format header
    const csvHeader = headers.join(",");

    // Convert JSON data to CSV format content
    const csvContent = jsonData
      .map((row: NotesType) => {
        return headers
          .map((fieldName: any) => {
            // For each row, get the corresponding value based on the key
            // and escape the value appropriately
            let fieldValue = row[fieldName as keyof NotesType];
            if (typeof fieldValue === "string") {
              // If the value contains a comma, wrap the entire field in double quotes
              if (fieldValue.includes(",")) {
                fieldValue = `"${fieldValue}"`;
              }
            }
            return fieldValue;
          })
          .join(",");
      })
      .join("\n");

    const csvString = `\uFEFF${csvHeader}\n${csvContent}`;

    return csvString;
  }, []);

  const jsonToXml = useCallback(
    (notes: NotesType[], rootName: string = "root"): string => {
      let xml = `<${rootName}>`;

      notes.forEach((note, index) => {
        xml += `<note index="${index}">`;
        xml += `<id>${note.id}</id>`;
        xml += `<title>${note.title}</title>`;
        xml += `<body>${note.body}</body>`;
        xml += `<updated>${note.updated}</updated>`;
        xml += `</note>`;
      });

      xml += `</${rootName}>`;

      return xml;
    },
    []
  );

  const handleOpenupload = useCallback(() => {
    if (uploadRef.current) {
      uploadRef.current?.click();
    }
  }, []);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files![0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const contents = e.target!.result;
      const fileType = file.type;

      if (fileType === "text/xml") {
        // 处理 XML 文件
        const notes = parseXmlToNotes(contents as string);
        NotesAPI.multipleUpdateNote(notes);
        refreshNotes();
      } else if (fileType === "text/csv") {
        // 处理 CSV 文件
        const notes = parseCsvToNotes(contents as string);
        NotesAPI.multipleUpdateNote(notes);
        refreshNotes();
      } else {
        console.error("Unsupported file type.");
      }
    };

    reader.readAsText(file);
  };

  const parseXmlToNotes = useCallback((xmlString: string): NotesType[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const notes: NotesType[] = [];

    const noteElements = xmlDoc.getElementsByTagName("note");
    for (let i = 0; i < noteElements.length; i++) {
      const noteElement = noteElements[i];
      const id = parseInt(noteElement.querySelector("id")!.textContent!);
      const title = noteElement.querySelector("title")!.textContent!;
      const body = noteElement.querySelector("body")!.textContent!;
      const updated = noteElement.querySelector("updated")!.textContent!;
      notes.push({ id, title, body, updated });
    }

    return notes;
  }, []);

  const parseCsvToNotes = useCallback((csvString: string): NotesType[] => {
    const lines = csvString.split("\n");
    const notes: NotesType[] = [];

    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(",");
      if (columns.length === 4) {
        const id = parseInt(columns[0]);
        const title = columns[1];
        const body = columns[2];
        const updated = columns[3];
        notes.push({ id, title, body, updated });
      }
    }

    return notes;
  }, []);

  return (
    <div className={styles.notes__sidebar}>
      <button
        className={styles.notes__add}
        type="button"
        onClick={() => {
          onNoteAdd();
        }}
      >
        添加新的笔记 📒
      </button>
      <button
        className={styles.notes__add}
        type="button"
        onClick={() => handleOpenupload()}
      >
        导入
        <input
          ref={uploadRef}
          style={{ display: "none" }}
          type="file"
          accept=".xml,.csv"
          onChange={(event) => handleFileUpload(event)}
        />
      </button>
      <button
        className={styles.notes__add}
        type="button"
        onClick={() => downloadCsvFromJson(notes)}
      >
        导出
      </button>
      <div className={styles.notes__list} ref={scrollRef}>
        {notes.map((item) => (
          <div
            className={`${styles.notes__list_item} ${
              item.id === activeNote?.id
                ? styles.notes__list_item__selected
                : ""
            }`}
            data-note-id={item.id}
            key={item.id}
            onClick={() => onNoteSelect(item.id)}
            onDoubleClick={() => handleDeleteModalOpen(item.id)}
          >
            <div className={styles.notes__small_title}>
              {item.title.substring(0, MAX_TITLE_LENGTH)}
              {item.title.length > MAX_TITLE_LENGTH ? "..." : ""}
            </div>
            <div className={styles.notes__small_body}>
              {item.body.substring(0, MAX_BODY_LENGTH)}
              {item.body.length > MAX_BODY_LENGTH ? "..." : ""}
            </div>
            <div className={styles.notes__small_updated}>
              {new Date(item.updated).toLocaleString(undefined, {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Siderbar;

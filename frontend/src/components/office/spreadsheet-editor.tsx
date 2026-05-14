"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { LocalFile, CellData, SheetData, SpreadsheetData } from "@/types/file";

interface SpreadsheetEditorProps {
  file: LocalFile;
  onChange: (file: LocalFile) => void;
}

const COLS = 26; // A-Z
const ROWS = 100;
const COL_WIDTH = 100;
const ROW_HEIGHT = 28;

function colToLetter(col: number): string {
  return String.fromCharCode(65 + col);
}

function cellId(col: number, row: number): string {
  return `${colToLetter(col)}${row + 1}`;
}

export function SpreadsheetEditor({ file, onChange }: SpreadsheetEditorProps) {
  const [data, setData] = useState<SpreadsheetData>(() => {
    const defaultData: SpreadsheetData = {
      sheets: [{ name: "Sheet1", cells: {} }],
      activeSheetIndex: 0,
    };
    if (file.content && typeof file.content === "object" && "sheets" in file.content) {
      return file.content as SpreadsheetData;
    }
    return defaultData;
  });

  const [selectedCell, setSelectedCell] = useState<string>("A1");
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [formulaBarValue, setFormulaBarValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeSheet = data.sheets[data.activeSheetIndex];

  const handleAutoSave = useCallback(
    (newData: SpreadsheetData) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        onChange({
          ...file,
          content: newData,
          updatedAt: new Date().toISOString(),
        });
      }, 1000);
    },
    [file, onChange]
  );

  const updateCell = (cellId: string, value: string) => {
    const newData = { ...data };
    const sheet = { ...newData.sheets[data.activeSheetIndex] };
    const cells = { ...sheet.cells };

    cells[cellId] = {
      value,
      formula: value.startsWith("=") ? value : undefined,
    };

    sheet.cells = cells;
    newData.sheets[data.activeSheetIndex] = sheet;

    setData(newData);
    handleAutoSave(newData);
  };

  const handleCellClick = (cellId: string) => {
    setSelectedCell(cellId);
    setEditingCell(null);
    const cell = activeSheet.cells[cellId];
    setFormulaBarValue(cell?.value || "");
  };

  const handleCellDoubleClick = (cellId: string) => {
    setEditingCell(cellId);
    const cell = activeSheet.cells[cellId];
    setEditValue(cell?.value || "");
  };

  const handleCellKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (editingCell) {
        updateCell(editingCell, editValue);
        setEditingCell(null);
      }
      // Move to next row
      const match = selectedCell.match(/([A-Z]+)(\d+)/);
      if (match) {
        const [, col, row] = match;
        const newRow = parseInt(row) + 1;
        if (newRow <= ROWS) {
          setSelectedCell(`${col}${newRow}`);
        }
      }
    } else if (e.key === "Escape") {
      setEditingCell(null);
      setEditValue("");
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (editingCell) {
        updateCell(editingCell, editValue);
        setEditingCell(null);
      }
      const col = selectedCell.charCodeAt(0) - 65;
      if (col < COLS - 1) {
        setSelectedCell(String.fromCharCode(65 + col + 1) + selectedCell.slice(1));
      }
    }
  };

  const handleFormulaBarChange = (value: string) => {
    setFormulaBarValue(value);
    if (editingCell) {
      setEditValue(value);
    } else {
      updateCell(selectedCell, value);
    }
  };

  const handleAddSheet = () => {
    const newSheet: SheetData = {
      name: `Sheet${data.sheets.length + 1}`,
      cells: {},
    };
    setData({
      ...data,
      sheets: [...data.sheets, newSheet],
      activeSheetIndex: data.sheets.length,
    });
  };

  const handleDeleteSheet = (index: number) => {
    if (data.sheets.length <= 1) return;
    const newSheets = data.sheets.filter((_, i) => i !== index);
    setData({
      ...data,
      sheets: newSheets,
      activeSheetIndex: Math.min(data.activeSheetIndex, newSheets.length - 1),
    });
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  return (
    <div className="h-full flex flex-col bg-[var(--bg-secondary)]">
      {/* Sheet Tabs */}
      <div className="flex items-center gap-1 px-2 py-1 bg-[var(--bg-primary)] border-b border-[var(--border-light)]">
        {data.sheets.map((sheet, index) => (
          <div
            key={index}
            onClick={() => setData({ ...data, activeSheetIndex: index })}
            className={`px-3 py-1 text-sm rounded cursor-pointer ${
              data.activeSheetIndex === index
                ? "bg-[var(--office-blue)] text-white"
                : "hover:bg-[var(--bg-hover)]"
            }`}
          >
            {sheet.name}
          </div>
        ))}
        <button
          onClick={handleAddSheet}
          className="px-2 py-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          + 添加
        </button>
      </div>

      {/* Formula Bar */}
      <div className="flex items-center h-10 px-4 bg-[var(--bg-primary)] border-b border-[var(--border-light)] gap-2">
        <div className="w-16 text-center text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded px-2 py-1">
          {selectedCell}
        </div>
        <span className="text-sm text-[var(--text-muted)]">fx</span>
        <input
          type="text"
          value={editingCell ? editValue : formulaBarValue}
          onChange={(e) => {
            if (editingCell) {
              setEditValue(e.target.value);
            } else {
              handleFormulaBarChange(e.target.value);
            }
          }}
          onKeyDown={handleCellKeyDown}
          className="flex-1 h-8 px-2 text-sm border border-[var(--border-light)] rounded focus:outline-none focus:border-[var(--border-focus)]"
          placeholder="输入值或公式 (如 =SUM(A1:A10))"
        />
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <div className="inline-block min-w-full">
          {/* Header Row */}
          <div className="flex sticky top-0 z-10 bg-[var(--bg-secondary)]">
            <div className="w-12 h-7 flex-shrink-0 border border-[var(--border-light)] bg-[var(--bg-tertiary)]" />
            {Array.from({ length: COLS }).map((_, col) => (
              <div
                key={col}
                className="w-[100px] h-7 flex-shrink-0 flex items-center justify-center text-xs font-medium text-[var(--text-secondary)] border border-[var(--border-light)] bg-[var(--bg-tertiary)]"
              >
                {colToLetter(col)}
              </div>
            ))}
          </div>

          {/* Data Rows */}
          {Array.from({ length: ROWS }).map((_, row) => (
            <div key={row} className="flex">
              {/* Row Number */}
              <div className="w-12 h-[28px] flex-shrink-0 flex items-center justify-center text-xs text-[var(--text-muted)] border border-[var(--border-light)] bg-[var(--bg-tertiary)]">
                {row + 1}
              </div>

              {/* Cells */}
              {Array.from({ length: COLS }).map((_, col) => {
                const id = cellId(col, row);
                const cell = activeSheet.cells[id];
                const isSelected = selectedCell === id;
                const isEditing = editingCell === id;

                return (
                  <div
                    key={col}
                    onClick={() => handleCellClick(id)}
                    onDoubleClick={() => handleCellDoubleClick(id)}
                    className={`w-[100px] h-[28px] flex-shrink-0 border border-[var(--border-light)] ${
                      isSelected
                        ? "ring-2 ring-[var(--office-blue)] ring-inset"
                        : ""
                    } ${isEditing ? "p-0" : "px-2"}`}
                  >
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleCellKeyDown}
                        className="w-full h-full px-2 text-sm border-none outline-none"
                        autoFocus
                      />
                    ) : (
                      <div className="w-full h-full flex items-center text-sm truncate">
                        {cell?.value || ""}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between h-6 px-4 bg-[var(--bg-primary)] border-t border-[var(--border-light)] text-xs text-[var(--text-muted)]">
        <span>
          就绪 · {ROWS} 行 × {COLS} 列
        </span>
        <span>
          当前 Sheet: {activeSheet.name} · {Object.keys(activeSheet.cells).length} 个有数据的单元格
        </span>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Upload, Plus, Trash2, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { createSafeFormulaEvaluator } from "./safe-formula-evaluator";

interface Cell {
  value: string;
  formula?: string;
}

interface SpreadsheetData {
  [key: string]: Cell;
}

const ROWS = 20;
const COLS = 10;

const getCellId = (row: number, col: number) => {
  const colLetter = String.fromCharCode(65 + col);
  return `${colLetter}${row + 1}`;
};

// 安全的公式求值函数
const evaluateFormula = createSafeFormulaEvaluator();

export default function SpreadsheetEditor() {
  const [data, setData] = useState<SpreadsheetData>({});
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const getCellValue = useCallback(
    (cellId: string): string => {
      const cell = data[cellId];
      if (!cell) return "";
      if (cell.formula) {
        try {
          return evaluateFormula(cell.formula, data);
        } catch {
          return "#ERROR";
        }
      }
      return cell.value;
    },
    [data]
  );

  const handleCellClick = useCallback(
    (cellId: string) => {
      setSelectedCell(cellId);
      const cell = data[cellId];
      setEditValue(cell?.formula || cell?.value || "");
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [data]
  );

  const handleCellUpdate = useCallback(
    (cellId: string, value: string) => {
      setData((prev) => {
        const newData = { ...prev };
        if (value.startsWith("=")) {
          newData[cellId] = { value: "", formula: value };
        } else {
          newData[cellId] = { value };
        }
        return newData;
      });
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!selectedCell) return;

      if (e.key === "Enter") {
        handleCellUpdate(selectedCell, editValue);
        setSelectedCell(null);
      } else if (e.key === "Escape") {
        setSelectedCell(null);
      }
    },
    [selectedCell, editValue, handleCellUpdate]
  );

  const handleExport = useCallback(() => {
    const exportData: (string | number)[][] = [];
    for (let row = 0; row < ROWS; row++) {
      const rowData: (string | number)[] = [];
      for (let col = 0; col < COLS; col++) {
        const cellId = getCellId(row, col);
        const value = getCellValue(cellId);
        const numValue = Number(value);
        rowData.push(!isNaN(numValue) && value !== "" ? numValue : value);
      }
      exportData.push(rowData);
    }

    const ws = XLSX.utils.aoa_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "spreadsheet.xlsx");
  }, [data, getCellValue]);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
            header: 1,
          }) as (string | number)[][];

          const newData: SpreadsheetData = {};
          jsonData.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
              if (cell !== undefined && cell !== null && cell !== "") {
                const cellId = getCellId(rowIndex, colIndex);
                const cellValue = String(cell);
                if (cellValue.startsWith("=")) {
                  newData[cellId] = { value: "", formula: cellValue };
                } else {
                  newData[cellId] = { value: cellValue };
                }
              }
            });
          });

          setData(newData);
        } catch (error) {
          console.error("Error importing file:", error);
        }
      };
      reader.readAsArrayBuffer(file);
      e.target.value = "";
    },
    []
  );

  const clearSpreadsheet = useCallback(() => {
    setData({});
    setSelectedCell(null);
    setEditValue("");
  }, []);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold">Spreadsheet Editor</h2>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleImport}
            className="hidden"
            id="spreadsheet-import"
          />
          <label htmlFor="spreadsheet-import">
            <Button variant="outline" size="sm" className="cursor-pointer" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </span>
            </Button>
          </label>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={clearSpreadsheet}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 bg-gray-50"></TableHead>
              {Array.from({ length: COLS }, (_, i) => (
                <TableHead
                  key={i}
                  className="w-24 text-center bg-gray-50 font-medium"
                >
                  {String.fromCharCode(65 + i)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: ROWS }, (_, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell className="w-10 text-center bg-gray-50 font-medium text-sm">
                  {rowIndex + 1}
                </TableCell>
                {Array.from({ length: COLS }, (_, colIndex) => {
                  const cellId = getCellId(rowIndex, colIndex);
                  const isSelected = selectedCell === cellId;
                  const displayValue = getCellValue(cellId);

                  return (
                    <TableCell
                      key={colIndex}
                      className={`w-24 p-0 border cursor-pointer ${
                        isSelected
                          ? "ring-2 ring-blue-500 z-10"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleCellClick(cellId)}
                    >
                      {isSelected ? (
                        <Input
                          ref={inputRef}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={() => {
                            handleCellUpdate(cellId, editValue);
                            setSelectedCell(null);
                          }}
                          className="w-full h-full border-0 rounded-none focus-visible:ring-0"
                        />
                      ) : (
                        <div className="w-full h-full px-2 py-1 text-sm truncate">
                          {displayValue}
                        </div>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export interface CellData {
  value: string;
  formula?: string;
  style?: CellStyle;
}

export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  fontColor?: string;
  bgColor?: string;
  align?: "left" | "center" | "right";
  border?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

export interface SheetData {
  name: string;
  cells: Record<string, CellData>;
}

export interface SpreadsheetData {
  sheets: SheetData[];
  activeSheetIndex: number;
}

export interface SlideElement {
  id: string;
  type: "text" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  style?: {
    fontSize?: number;
    fontColor?: string;
    bgColor?: string;
    border?: string;
  };
}

export interface SlideData {
  id: string;
  elements: SlideElement[];
  background?: string;
  notes?: string;
}

export interface PresentationData {
  slides: SlideData[];
  activeSlideIndex: number;
}

export interface DocumentContent {
  type: string;
  content?: unknown[];
}

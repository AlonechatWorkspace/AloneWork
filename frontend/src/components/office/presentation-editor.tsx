"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Plus, Trash2, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import type { LocalFile, SlideData, SlideElement, PresentationData } from "@/types/file";

interface PresentationEditorProps {
  file: LocalFile;
  onChange: (file: LocalFile) => void;
}

const SLIDE_WIDTH = 960;
const SLIDE_HEIGHT = 540;
const THUMBNAIL_WIDTH = 192;
const THUMBNAIL_HEIGHT = 108;

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function PresentationEditor({ file, onChange }: PresentationEditorProps) {
  const [data, setData] = useState<PresentationData>(() => {
    const defaultData: PresentationData = {
      slides: [{ id: generateId(), elements: [] }],
      activeSlideIndex: 0,
    };
    if (file.content && typeof file.content === "object" && "slides" in file.content) {
      return file.content as PresentationData;
    }
    return defaultData;
  });

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeSlide = data.slides[data.activeSlideIndex];

  const handleAutoSave = useCallback(
    (newData: PresentationData) => {
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

  const updateSlide = (slideIndex: number, slide: SlideData) => {
    const newData = { ...data };
    const newSlides = [...newData.slides];
    newSlides[slideIndex] = slide;
    newData.slides = newSlides;
    setData(newData);
    handleAutoSave(newData);
  };

  const addSlide = () => {
    const newSlide: SlideData = {
      id: generateId(),
      elements: [],
    };
    const newData = {
      ...data,
      slides: [...data.slides, newSlide],
      activeSlideIndex: data.slides.length,
    };
    setData(newData);
    handleAutoSave(newData);
  };

  const deleteSlide = (index: number) => {
    if (data.slides.length <= 1) return;
    const newSlides = data.slides.filter((_, i) => i !== index);
    setData({
      ...data,
      slides: newSlides,
      activeSlideIndex: Math.min(data.activeSlideIndex, newSlides.length - 1),
    });
  };

  const duplicateSlide = (index: number) => {
    const slide = data.slides[index];
    const newSlide: SlideData = {
      ...slide,
      id: generateId(),
      elements: slide.elements.map((el) => ({ ...el, id: generateId() })),
    };
    const newSlides = [...data.slides];
    newSlides.splice(index + 1, 0, newSlide);
    setData({
      ...data,
      slides: newSlides,
      activeSlideIndex: index + 1,
    });
  };

  const addTextElement = () => {
    const newElement: SlideElement = {
      id: generateId(),
      type: "text",
      x: 100,
      y: 200,
      width: 300,
      height: 100,
      content: "双击编辑文本",
      style: {
        fontSize: 24,
        fontColor: "#1a1a1a",
      },
    };
    const newSlide = { ...activeSlide, elements: [...activeSlide.elements, newElement] };
    updateSlide(data.activeSlideIndex, newSlide);
    setSelectedElement(newElement.id);
  };

  const addShapeElement = () => {
    const newElement: SlideElement = {
      id: generateId(),
      type: "shape",
      x: 100,
      y: 200,
      width: 200,
      height: 100,
      content: "",
      style: {
        bgColor: "#e0e0e0",
        border: "1px solid #c0c0c0",
      },
    };
    const newSlide = { ...activeSlide, elements: [...activeSlide.elements, newElement] };
    updateSlide(data.activeSlideIndex, newSlide);
    setSelectedElement(newElement.id);
  };

  const updateElement = (elementId: string, updates: Partial<SlideElement>) => {
    const newElements = activeSlide.elements.map((el) =>
      el.id === elementId ? { ...el, ...updates } : el
    );
    const newSlide = { ...activeSlide, elements: newElements };
    updateSlide(data.activeSlideIndex, newSlide);
  };

  const deleteElement = (elementId: string) => {
    const newElements = activeSlide.elements.filter((el) => el.id !== elementId);
    const newSlide = { ...activeSlide, elements: newElements };
    updateSlide(data.activeSlideIndex, newSlide);
    setSelectedElement(null);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent, element: SlideElement) => {
    e.stopPropagation();
    setSelectedElement(element.id);
    setDragStart({ x: e.clientX, y: e.clientY });
    setElementStart({
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
    });
    setIsDragging(true);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    const newX = Math.max(0, Math.min(SLIDE_WIDTH - elementStart.width, elementStart.x + dx));
    const newY = Math.max(0, Math.min(SLIDE_HEIGHT - elementStart.height, elementStart.y + dy));

    updateElement(selectedElement, { x: newX, y: newY });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedElement(null);
    }
  };

  const handleTextDoubleClick = (e: React.MouseEvent, element: SlideElement) => {
    e.stopPropagation();
    const newContent = prompt("输入文本内容:", element.content);
    if (newContent !== null) {
      updateElement(element.id, { content: newContent });
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedElement && (e.key === "Delete" || e.key === "Backspace")) {
        deleteElement(selectedElement);
      }
    },
    [selectedElement]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="h-full flex bg-[var(--bg-secondary)]">
      {/* Thumbnails Panel */}
      <div className="w-[220px] bg-[var(--bg-primary)] border-r border-[var(--border-light)] flex flex-col">
        <div className="p-3 border-b border-[var(--border-light)]">
          <h3 className="text-sm font-medium">幻灯片</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {data.slides.length} 张幻灯片
          </p>
        </div>

        <div className="flex-1 overflow-auto p-2">
          <div className="space-y-2">
            {data.slides.map((slide, index) => (
              <div
                key={slide.id}
                onClick={() => setData({ ...data, activeSlideIndex: index })}
                className={`relative rounded overflow-hidden cursor-pointer border-2 transition-all ${
                  data.activeSlideIndex === index
                    ? "border-[var(--office-blue)] shadow-md"
                    : "border-transparent hover:border-[var(--border-medium)]"
                }`}
              >
                <div
                  className="bg-white"
                  style={{
                    width: THUMBNAIL_WIDTH,
                    height: THUMBNAIL_HEIGHT,
                    transform: "scale(1)",
                    transformOrigin: "top left",
                  }}
                >
                  <div className="w-full h-full bg-white relative">
                    {slide.elements.map((el) => (
                      <div
                        key={el.id}
                        className="absolute"
                        style={{
                          left: (el.x / SLIDE_WIDTH) * 100 + "%",
                          top: (el.y / SLIDE_HEIGHT) * 100 + "%",
                          width: (el.width / SLIDE_WIDTH) * 100 + "%",
                          height: (el.height / SLIDE_HEIGHT) * 100 + "%",
                        }}
                      >
                        {el.type === "text" && (
                          <div
                            className="w-full h-full overflow-hidden text-ellipsis"
                            style={{
                              fontSize: Math.max(6, (el.style?.fontSize || 24) * 0.2),
                              color: el.style?.fontColor || "#1a1a1a",
                            }}
                          >
                            {el.content}
                          </div>
                        )}
                        {el.type === "shape" && (
                          <div
                            className="w-full h-full"
                            style={{
                              backgroundColor: el.style?.bgColor || "#e0e0e0",
                              border: el.style?.border || "1px solid #c0c0c0",
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateSlide(index);
                    }}
                    className="p-1 bg-white rounded shadow hover:bg-[var(--bg-hover)]"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {data.slides.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSlide(index);
                      }}
                      className="p-1 bg-white rounded shadow hover:bg-[var(--error-bg)] hover:text-[var(--error)]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="absolute bottom-1 left-1 text-xs text-[var(--text-muted)] bg-white/80 px-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addSlide}
            className="w-full mt-2 py-2 border border-dashed border-[var(--border-medium)] rounded text-sm text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            + 添加幻灯片
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-primary)] border-b border-[var(--border-light)]">
          <button
            onClick={addTextElement}
            className="px-3 py-1.5 text-sm rounded hover:bg-[var(--bg-hover)] border border-[var(--border-light)]"
          >
            添加文本框
          </button>
          <button
            onClick={addShapeElement}
            className="px-3 py-1.5 text-sm rounded hover:bg-[var(--bg-hover)] border border-[var(--border-light)]"
          >
            添加形状
          </button>

          <div className="flex-1" />

          <button
            onClick={() =>
              setData({
                ...data,
                activeSlideIndex: Math.max(0, data.activeSlideIndex - 1),
              })
            }
            disabled={data.activeSlideIndex === 0}
            className="p-1.5 rounded hover:bg-[var(--bg-hover)] disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm">
            {data.activeSlideIndex + 1} / {data.slides.length}
          </span>
          <button
            onClick={() =>
              setData({
                ...data,
                activeSlideIndex: Math.min(data.slides.length - 1, data.activeSlideIndex + 1),
              })
            }
            disabled={data.activeSlideIndex === data.slides.length - 1}
            className="p-1.5 rounded hover:bg-[var(--bg-hover)] disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Canvas */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            className="relative bg-white shadow-xl"
            style={{
              width: SLIDE_WIDTH,
              height: SLIDE_HEIGHT,
              backgroundColor: activeSlide.background || "#ffffff",
            }}
          >
            {activeSlide.elements.map((element) => (
              <div
                key={element.id}
                onMouseDown={(e) => handleCanvasMouseDown(e, element)}
                onDoubleClick={(e) => element.type === "text" && handleTextDoubleClick(e, element)}
                className={`absolute cursor-move ${
                  selectedElement === element.id
                    ? "ring-2 ring-[var(--office-blue)] ring-offset-1"
                    : ""
                }`}
                style={{
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                }}
              >
                {element.type === "text" && (
                  <div
                    className="w-full h-full overflow-hidden"
                    style={{
                      fontSize: element.style?.fontSize || 24,
                      color: element.style?.fontColor || "#1a1a1a",
                    }}
                  >
                    {element.content}
                  </div>
                )}
                {element.type === "shape" && (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundColor: element.style?.bgColor || "#e0e0e0",
                      border: element.style?.border || "1px solid #c0c0c0",
                    }}
                  />
                )}
              </div>
            ))}

            {activeSlide.elements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)]">
                <div className="text-center">
                  <p className="mb-2">点击上方按钮添加内容</p>
                  <p className="text-sm">或直接拖拽添加文本框和形状</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between h-6 px-4 bg-[var(--bg-primary)] border-t border-[var(--border-light)] text-xs text-[var(--text-muted)]">
          <span>
            16:9 比例 · {SLIDE_WIDTH} × {SLIDE_HEIGHT} px
          </span>
          <span>
            {activeSlide.elements.length} 个元素 · 第 {data.activeSlideIndex + 1} 页
          </span>
        </div>
      </div>
    </div>
  );
}

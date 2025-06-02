"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Pencil1Icon,
  Cross2Icon,
  CheckIcon,
  EyeOpenIcon,
  MagnifyingGlassIcon,
  ListBulletIcon,
  TrashIcon,
  DotsVerticalIcon,
  CopyIcon,
  ClipboardIcon,
  ImageIcon,
} from "@radix-ui/react-icons";

// Updated Types with Image Support
interface TextBlock {
  text: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  font: string;
  size: number;
  color: number;
  flags?: number;
  width?: number;
  height?: number;
}

interface ImageBlock {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  width: number;
  height: number;
  image_data: string; // base64 encoded
  format: string;
  image_id: string;
}

interface PDFPage {
  page_number: number;
  width: number;
  height: number;
  texts: TextBlock[];
  images: ImageBlock[];
}

interface PDFTextData {
  pages: PDFPage[];
  metadata?: {
    total_pages: number;
    total_text_blocks: number;
    total_images: number;
    extraction_method: string;
  };
}

// Utility function for class names
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

// Toast utility (simplified)
const showToast = (
  message: string,
  type: "success" | "error" | "info" = "info"
) => {
  if (type === "error") {
    alert(`Error: ${message}`);
  } else {
    console.log(`${type.toUpperCase()}: ${message}`);
  }
};

// Enhanced File Dropzone Component
const EnhancedFileDropzone = ({ onFileAccepted, disabled }: any) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf"
    );
    if (files.length > 0) {
      onFileAccepted(files);
    } else {
      showToast("Please upload a PDF file", "error");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileAccepted(Array.from(files));
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
          <svg
            className="h-6 w-6 sm:h-8 sm:w-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PDF Text & Image Editor
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2 px-4">
            Upload your PDF and edit text content with full image preservation
            using our advanced visual editor
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-8 transition-all duration-300 cursor-pointer group",
          isDragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50 scale-[1.02]"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="text-center space-y-3 sm:space-y-4">
          <div
            className={cn(
              "inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg transition-colors",
              isDragOver
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600"
            )}
          >
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div>
            <p className="text-base sm:text-lg font-medium">
              {isDragOver
                ? "Drop your PDF here"
                : "Choose PDF file or drag & drop"}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Supports PDF files up to 50MB • Text and images will be extracted
              automatically
            </p>
          </div>

          <Button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 pointer-events-none">
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Browse Files
          </Button>
        </div>

        {/* Animated border on drag */}
        {isDragOver && (
          <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 animate-pulse" />
        )}
      </div>

      {/* Features - Updated for images */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          {
            icon: "👁️",
            title: "Visual Editor",
            desc: "Click and edit text directly",
          },
          {
            icon: "🖼️",
            title: "Image Support",
            desc: "View and preserve all images",
          },
          {
            icon: "⚡",
            title: "LibreOffice-like",
            desc: "Familiar editing experience",
          },
        ].map((feature, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">{feature.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{feature.title}</p>
              <p className="text-xs text-gray-500 line-clamp-1">
                {feature.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Progress Component
const EnhancedProgress = ({ progress, isUploading, isProcessing }: any) => {
  const getStageInfo = () => {
    if (isUploading) return { label: "Uploading PDF...", icon: "📤" };
    if (isProcessing) {
      if (progress < 40)
        return { label: "Extracting text blocks...", icon: "📄" };
      if (progress < 70) return { label: "Extracting images...", icon: "🖼️" };
      if (progress < 90) return { label: "Analyzing structure...", icon: "⚙️" };
      return { label: "Finalizing...", icon: "✅" };
    }
    return { label: "Processing...", icon: "⚙️" };
  };

  const { label, icon } = getStageInfo();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse flex-shrink-0">
          <span className="text-white text-lg">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{label}</p>
          <p className="text-sm text-gray-500">
            {Math.round(progress)}% complete
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

// Enhanced Visual Text Editor Component with Image Support
const LibreOfficeVisualEditor = ({
  textBlocks,
  imageBlocks,
  pageWidth,
  pageHeight,
  onTextBlockUpdate,
  onTextBlockDelete,
  className = "",
}: {
  textBlocks: TextBlock[];
  imageBlocks: ImageBlock[];
  pageWidth: number;
  pageHeight: number;
  onTextBlockUpdate: (index: number, updatedBlock: TextBlock) => void;
  onTextBlockDelete: (index: number) => void;
  className?: string;
}) => {
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [selectedBlockType, setSelectedBlockType] = useState<"text" | "image">(
    "text"
  );
  const [editingBlock, setEditingBlock] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [scale, setScale] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedBlocks, setHighlightedBlocks] = useState<number[]>([]);
  const [copiedText, setCopiedText] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const [containerSize, setContainerSize] = useState({
    width: 800,
    height: 600,
  });

  // Calculate scale to fit the page in the container
  useEffect(() => {
    const updateScale = () => {
      if (canvasRef.current) {
        const containerWidth = canvasRef.current.clientWidth - 40;
        const containerHeight = Math.min(700, window.innerHeight * 0.7);
        const scaleX = containerWidth / pageWidth;
        const scaleY = containerHeight / pageHeight;
        const newScale = Math.min(scaleX, scaleY, 1.5);
        setScale(newScale);
        setContainerSize({ width: containerWidth, height: containerHeight });
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [pageWidth, pageHeight]);

  // Search functionality (text only)
  useEffect(() => {
    if (searchTerm.trim()) {
      const matches = textBlocks
        .map((block, index) => ({ block, index }))
        .filter(({ block }) =>
          block.text.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(({ index }) => index);
      setHighlightedBlocks(matches);
    } else {
      setHighlightedBlocks([]);
    }
  }, [searchTerm, textBlocks]);

  // Auto-focus on edit input
  useEffect(() => {
    if (editingBlock !== null && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingBlock]);

  const handleBlockClick = (
    index: number,
    type: "text" | "image",
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    if (type === "image") {
      // For images, just select but don't edit
      setSelectedBlock(index);
      setSelectedBlockType("image");
      setEditingBlock(null);
      setEditingText("");
      return;
    }

    // Text block handling
    if (editingBlock === index && selectedBlockType === "text") {
      return;
    }

    // If we're editing another block, save it first
    if (
      editingBlock !== null &&
      selectedBlockType === "text" &&
      editingText !== textBlocks[editingBlock].text
    ) {
      const updatedBlock = { ...textBlocks[editingBlock], text: editingText };
      onTextBlockUpdate(editingBlock, updatedBlock);
    }

    // Start editing this text block
    setSelectedBlock(index);
    setSelectedBlockType("text");
    setEditingBlock(index);
    setEditingText(textBlocks[index].text);
  };

  const handleCanvasClick = () => {
    // Save current editing if any
    if (
      editingBlock !== null &&
      selectedBlockType === "text" &&
      editingText !== textBlocks[editingBlock].text
    ) {
      const updatedBlock = { ...textBlocks[editingBlock], text: editingText };
      onTextBlockUpdate(editingBlock, updatedBlock);
    }

    setSelectedBlock(null);
    setSelectedBlockType("text");
    setEditingBlock(null);
    setEditingText("");
  };

  const handleTextChange = (newText: string) => {
    setEditingText(newText);
  };

  const handleTextKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSaveEdit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      handleCancelEdit();
    }
  };

  const handleSaveEdit = () => {
    if (editingBlock !== null && selectedBlockType === "text") {
      const updatedBlock = { ...textBlocks[editingBlock], text: editingText };
      onTextBlockUpdate(editingBlock, updatedBlock);
      setEditingBlock(null);
      setEditingText("");
    }
  };

  const handleCancelEdit = () => {
    setEditingBlock(null);
    setEditingText("");
  };

  const handleDeleteBlock = (index: number) => {
    if (selectedBlockType === "text") {
      if (window.confirm("Are you sure you want to delete this text block?")) {
        onTextBlockDelete(index);
        setSelectedBlock(null);
        setEditingBlock(null);
      }
    }
  };

  const handleCopyText = (text: string) => {
    setCopiedText(text);
    navigator.clipboard.writeText(text);
    showToast("Text copied to clipboard", "success");
  };

  const handlePasteText = (index: number) => {
    if (copiedText && selectedBlockType === "text") {
      const updatedBlock = { ...textBlocks[index], text: copiedText };
      onTextBlockUpdate(index, updatedBlock);
      showToast("Text pasted", "success");
    }
  };

  const getTextBlockStyle = (block: TextBlock, index: number) => {
    const isSelected = selectedBlock === index && selectedBlockType === "text";
    const isEditing = editingBlock === index;
    const isHighlighted = highlightedBlocks.includes(index);

    // Convert color integer to RGB
    const r = (block.color >> 16) & 255;
    const g = (block.color >> 8) & 255;
    const b = block.color & 255;

    // Calculate original dimensions
    const originalWidth = (block.x1 - block.x0) * scale;
    const originalHeight = (block.y1 - block.y0) * scale;

    // Minimum touch-friendly dimensions
    const minTouchSize = 44;
    const minWidth = Math.max(originalWidth, minTouchSize);
    const minHeight = Math.max(originalHeight, Math.max(minTouchSize, 20));

    // Calculate centering offset for small blocks
    const widthOffset = Math.max(0, (minWidth - originalWidth) / 2);
    const heightOffset = Math.max(0, (minHeight - originalHeight) / 2);

    return {
      position: "absolute" as const,
      left: block.x0 * scale - widthOffset,
      top: block.y0 * scale - heightOffset,
      width: minWidth,
      height: minHeight,
      minWidth: minTouchSize,
      minHeight: Math.max(minTouchSize, 20),
      fontSize: Math.max(block.size * scale * 0.8, 10),
      fontFamily: block.font.includes("Times")
        ? "Times, serif"
        : block.font.includes("Courier")
        ? "Courier, monospace"
        : "Arial, sans-serif",
      border: isEditing
        ? "2px solid #10b981"
        : isSelected
        ? "2px solid #3b82f6"
        : isHighlighted
        ? "2px solid #f59e0b"
        : originalWidth < 30 || originalHeight < 20
        ? "2px dashed rgba(59, 130, 246, 0.5)"
        : "1px solid rgba(59, 130, 246, 0.2)",
      backgroundColor: isEditing
        ? "rgba(16, 185, 129, 0.15)"
        : isSelected
        ? "rgba(59, 130, 246, 0.15)"
        : isHighlighted
        ? "rgba(245, 158, 11, 0.15)"
        : originalWidth < 30 || originalHeight < 20
        ? "rgba(59, 130, 246, 0.1)"
        : "rgba(255, 255, 255, 0.8)",
      cursor: isEditing ? "text" : "pointer",
      padding: originalWidth < 30 ? "6px 8px" : "2px 4px",
      borderRadius: "4px",
      transition: "all 0.2s ease",
      overflow: "hidden",
      display: "flex",
      alignItems: originalHeight < 20 ? "center" : "flex-start",
      justifyContent: originalWidth < 30 ? "center" : "flex-start",
      color: `rgb(${r}, ${g}, ${b})`,
      lineHeight: "1.2",
      wordWrap: "break-word" as const,
      boxShadow: isEditing
        ? "0 4px 12px rgba(16, 185, 129, 0.3)"
        : isSelected
        ? "0 2px 8px rgba(59, 130, 246, 0.3)"
        : isHighlighted
        ? "0 2px 8px rgba(245, 158, 11, 0.3)"
        : originalWidth < 30 || originalHeight < 20
        ? "0 2px 4px rgba(59, 130, 246, 0.2)"
        : "none",
      zIndex: isEditing ? 20 : isSelected ? 10 : isHighlighted ? 5 : 1,
      outline:
        originalWidth < 30 || originalHeight < 20
          ? "1px dotted rgba(59, 130, 246, 0.3)"
          : "none",
      outlineOffset: "2px",
    };
  };

  const getImageBlockStyle = (block: ImageBlock, index: number) => {
    const isSelected = selectedBlock === index && selectedBlockType === "image";

    return {
      position: "absolute" as const,
      left: block.x0 * scale,
      top: block.y0 * scale,
      width: block.width * scale,
      height: block.height * scale,
      border: isSelected
        ? "3px solid #8b5cf6"
        : "1px solid rgba(139, 92, 246, 0.3)",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      overflow: "hidden",
      boxShadow: isSelected
        ? "0 4px 12px rgba(139, 92, 246, 0.4)"
        : "0 1px 3px rgba(0, 0, 0, 0.1)",
      zIndex: isSelected ? 8 : 2,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
    };
  };

  const scaledPageWidth = pageWidth * scale;
  const scaledPageHeight = pageHeight * scale;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="space-y-4">
        {/* Main controls */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <EyeOpenIcon className="h-5 w-5" />
              Visual Editor (LibreOffice-like)
            </h3>
            <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
              <span>{textBlocks.length} text blocks</span>
              <span>•</span>
              <span>{imageBlocks.length} images</span>
              <span>•</span>
              <span>Scale: {Math.round(scale * 100)}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale(Math.max(0.2, scale - 0.1))}
              disabled={scale <= 0.2}
            >
              Zoom Out
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScale(Math.min(3, scale + 0.1))}
              disabled={scale >= 3}
            >
              Zoom In
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (canvasRef.current) {
                  const containerWidth = canvasRef.current.clientWidth - 40;
                  const newScale = containerWidth / pageWidth;
                  setScale(Math.min(newScale, 2));
                }
              }}
            >
              Fit Width
            </Button>
            <Button variant="outline" size="sm" onClick={() => setScale(1)}>
              Reset Zoom
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
          <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search text in this page..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          {highlightedBlocks.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {highlightedBlocks.length} matches
            </span>
          )}
          {searchTerm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm("")}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Click</strong> on any text to start editing directly.{" "}
          <strong>Images</strong> are preserved and displayed but cannot be
          edited. Small text blocks have enlarged click areas for easy tapping.{" "}
          <strong>Enter</strong> to save, <strong>Escape</strong> to cancel.
        </p>
      </div>

      {/* Visual Canvas */}
      <div className="border rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
        <div
          ref={canvasRef}
          className="relative bg-white dark:bg-gray-100 border border-gray-300 mx-auto overflow-auto shadow-lg"
          style={{
            width: Math.min(scaledPageWidth, containerSize.width),
            height: Math.min(scaledPageHeight, containerSize.height),
            maxWidth: "100%",
            maxHeight: "75vh",
          }}
          onClick={handleCanvasClick}
        >
          {/* Page background grid */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(to right, #000 1px, transparent 1px),
                linear-gradient(to bottom, #000 1px, transparent 1px)
              `,
              backgroundSize: `${25 * scale}px ${25 * scale}px`,
            }}
          />

          {/* Page dimensions indicator */}
          <div className="absolute top-2 left-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
            {Math.round(pageWidth)} × {Math.round(pageHeight)} px
          </div>

          {/* Content type indicator */}
          <div className="absolute top-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
            📝 {textBlocks.length} text • 🖼️ {imageBlocks.length} images
          </div>

          {/* Image blocks (rendered first, behind text) */}
          {imageBlocks.map((block, index) => (
            <div
              key={`image-${index}`}
              style={getImageBlockStyle(block, index)}
              onClick={(e) => handleBlockClick(index, "image", e)}
              title={`Image: ${block.image_id} (${
                block.format
              })\nSize: ${Math.round(block.width)} × ${Math.round(
                block.height
              )} px`}
              className="group hover:shadow-lg transition-all duration-200"
            >
              {block.image_data && block.format !== "placeholder" ? (
                <img
                  src={`data:image/${block.format};base64,${block.image_data}`}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              ) : (
                // Placeholder for missing images
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 mx-auto mb-1" />
                    <div className="text-xs">Image</div>
                    <div className="text-xs">{block.format}</div>
                  </div>
                </div>
              )}

              {/* Image indicator */}
              <div
                className={`absolute -top-4 -left-1 w-6 h-4 rounded-full text-xs flex items-center justify-center font-bold text-white ${
                  selectedBlock === index && selectedBlockType === "image"
                    ? "bg-purple-600"
                    : "bg-purple-400"
                }`}
              >
                🖼️
              </div>

              {/* Image selection indicator */}
              {selectedBlock === index && selectedBlockType === "image" && (
                <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-purple-600 bg-white px-2 py-1 rounded shadow whitespace-nowrap">
                  Image preserved in PDF
                </div>
              )}
            </div>
          ))}

          {/* Text blocks */}
          {textBlocks.map((block, index) => {
            const originalWidth = (block.x1 - block.x0) * scale;
            const originalHeight = (block.y1 - block.y0) * scale;
            const isSmallBlock = originalWidth < 30 || originalHeight < 20;

            return (
              <div
                key={`text-${index}`}
                style={getTextBlockStyle(block, index)}
                onClick={(e) => handleBlockClick(index, "text", e)}
                onContextMenu={(e) => {
                  e.preventDefault();
                }}
                title={
                  editingBlock === index
                    ? "Editing - Press Enter to save, Escape to cancel"
                    : `Click to edit: "${block.text.substring(0, 50)}${
                        block.text.length > 50 ? "..." : ""
                      }"${
                        isSmallBlock
                          ? " (Small text - click anywhere in this area)"
                          : ""
                      }`
                }
                className={`group hover:shadow-lg transition-all duration-200 ${
                  isSmallBlock
                    ? "hover:scale-105 hover:bg-blue-50"
                    : "hover:shadow-md"
                }`}
              >
                {editingBlock === index ? (
                  <textarea
                    ref={editInputRef}
                    value={editingText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    onKeyDown={handleTextKeyDown}
                    onBlur={handleSaveEdit}
                    className="w-full h-full bg-transparent border-none outline-none resize-none p-0 m-0"
                    style={{
                      fontSize: "inherit",
                      fontFamily: "inherit",
                      color: "inherit",
                      lineHeight: "1.2",
                      minHeight: "20px",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "inherit",
                      lineHeight: "1.2",
                      wordBreak: "break-word",
                      display: "-webkit-box",
                      WebkitLineClamp: Math.max(
                        1,
                        Math.floor(
                          ((block.y1 - block.y0) * scale) /
                            (block.size * scale * 1.2)
                        )
                      ),
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      width: "100%",
                      textAlign: isSmallBlock ? "center" : "left",
                    }}
                  >
                    {block.text}
                  </span>
                )}

                {/* Enhanced action buttons for small blocks */}
                {selectedBlock === index &&
                  selectedBlockType === "text" &&
                  editingBlock !== index && (
                    <div
                      className={`absolute ${
                        isSmallBlock ? "-top-10" : "-top-8"
                      } -right-1 flex gap-1 z-30`}
                    >
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBlockClick(index, "text", e);
                        }}
                        title="Edit text"
                      >
                        <Pencil1Icon className="h-3 w-3" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-6 w-6 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DotsVerticalIcon className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleCopyText(block.text)}
                          >
                            <CopyIcon className="h-4 w-4 mr-2" />
                            Copy Text
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePasteText(index)}
                            disabled={!copiedText}
                          >
                            <ClipboardIcon className="h-4 w-4 mr-2" />
                            Paste Text
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteBlock(index)}
                            className="text-red-600"
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete Block
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}

                {/* Enhanced block number indicator */}
                <div
                  className={`absolute ${
                    isSmallBlock ? "-top-6" : "-top-4"
                  } -left-1 ${
                    isSmallBlock ? "w-6 h-5" : "w-5 h-4"
                  } rounded-full text-xs flex items-center justify-center font-bold text-white ${
                    editingBlock === index
                      ? "bg-green-600"
                      : selectedBlock === index && selectedBlockType === "text"
                      ? "bg-blue-600"
                      : highlightedBlocks.includes(index)
                      ? "bg-yellow-500"
                      : "bg-gray-400"
                  }`}
                >
                  {index + 1}
                </div>

                {/* Small block indicator */}
                {isSmallBlock &&
                  selectedBlock !== index &&
                  editingBlock !== index && (
                    <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-blue-600 bg-white px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Small text - click to edit
                    </div>
                  )}
              </div>
            );
          })}

          {/* Empty state */}
          {textBlocks.length === 0 && imageBlocks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Pencil1Icon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No content found on this page</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current editing info */}
      {editingBlock !== null && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-green-800 dark:text-green-200">
              Editing Text Block #{editingBlock + 1}
            </h4>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit} variant="default">
                <CheckIcon className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button size="sm" onClick={handleCancelEdit} variant="outline">
                <Cross2Icon className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            Characters: {editingText.length} | Press Enter to save, Escape to
            cancel
          </p>
        </div>
      )}

      {/* Selected image info */}
      {selectedBlock !== null && selectedBlockType === "image" && (
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-purple-800 dark:text-purple-200">
              Selected Image #{selectedBlock + 1}
            </h4>
          </div>
          <div className="text-sm text-purple-700 dark:text-purple-300">
            <p>Format: {imageBlocks[selectedBlock].format}</p>
            <p>
              Size: {Math.round(imageBlocks[selectedBlock].width)} ×{" "}
              {Math.round(imageBlocks[selectedBlock].height)} px
            </p>
            <p>Images are preserved automatically when saving the PDF</p>
          </div>
        </div>
      )}

      {/* Search Results Summary */}
      {highlightedBlocks.length > 0 && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MagnifyingGlassIcon className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Found {highlightedBlocks.length} text matches for "{searchTerm}"
              </span>
            </div>
            <div className="flex gap-1">
              {highlightedBlocks.slice(0, 5).map((blockIndex) => (
                <Button
                  key={blockIndex}
                  size="sm"
                  variant="outline"
                  className="h-6 w-8 p-0 text-xs"
                  onClick={() => {
                    setSelectedBlock(blockIndex);
                    setSelectedBlockType("text");
                  }}
                >
                  {blockIndex + 1}
                </Button>
              ))}
              {highlightedBlocks.length > 5 && (
                <span className="text-xs text-muted-foreground flex items-center">
                  +{highlightedBlocks.length - 5} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Component
export function PdfTextEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<PDFTextData | null>(null);
  const [originalData, setOriginalData] = useState<PDFTextData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [editedFileUrl, setEditedFileUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTextBlock, setSelectedTextBlock] = useState<number | null>(
    null
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("visual");
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            if (hasUnsavedChanges && !isProcessing) {
              handleSaveEditedPDF();
            }
            break;
          case "r":
            e.preventDefault();
            if (hasUnsavedChanges) {
              handleReset();
            }
            break;
          case "ArrowLeft":
            e.preventDefault();
            setCurrentPage((prev) => Math.max(0, prev - 1));
            break;
          case "ArrowRight":
            e.preventDefault();
            if (extractedData) {
              setCurrentPage((prev) =>
                Math.min(extractedData.pages.length - 1, prev + 1)
              );
            }
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [hasUnsavedChanges, isProcessing, extractedData]);

  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024)
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleStartOver = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm(
        "You have unsaved changes. Are you sure you want to start over?"
      );
      if (!confirm) return;
    }

    setFile(null);
    setExtractedData(null);
    setOriginalData(null);
    setSessionId(null);
    setEditedFileUrl(null);
    setError(null);
    setCurrentPage(0);
    setSelectedTextBlock(null);
    setHasUnsavedChanges(false);
    setIsProcessing(false);
    setIsUploading(false);
    setProgress(0);
    setActiveTab("visual");
  }, [hasUnsavedChanges]);

  const handleFileUpload = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const pdfFile = acceptedFiles[0];

    if (pdfFile.size > 50 * 1024 * 1024) {
      showToast(
        "File too large - Please select a file smaller than 50MB",
        "error"
      );
      return;
    }

    setFile(pdfFile);
    setError(null);
    setEditedFileUrl(null);
    setHasUnsavedChanges(false);

    setIsProcessing(true);
    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", pdfFile);
    const apiUrl = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/pdf/extract-text`;

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", apiUrl);

      // const apiKey = "sk_d6c1daa54dbc95956b281fa02c544e7273ed10df60b211fe";
      // xhr.setRequestHeader("x-api-key", apiKey);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 60;
          setProgress(percentComplete);
        }
      };

      xhr.onload = function () {
        setIsUploading(false);

        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);

          let currentProgress = 60;
          const processingInterval = setInterval(() => {
            currentProgress += Math.random() * 8 + 2;
            setProgress(Math.min(currentProgress, 95));

            if (currentProgress >= 95) {
              clearInterval(processingInterval);

              setTimeout(() => {
                setProgress(100);
                setIsProcessing(false);

                if (data.extractedData?.pages) {
                  setExtractedData(data.extractedData);
                  setOriginalData(
                    JSON.parse(JSON.stringify(data.extractedData))
                  );
                  setSessionId(data.sessionId);

                  const totalBlocks = data.extractedData.pages.reduce(
                    (sum: number, page: PDFPage) => sum + page.texts.length,
                    0
                  );

                  const totalImages = data.extractedData.pages.reduce(
                    (sum: number, page: PDFPage) =>
                      sum + (page.images?.length || 0),
                    0
                  );

                  showToast(
                    `Content extracted successfully! Found ${data.extractedData.pages.length} pages with ${totalBlocks} text blocks and ${totalImages} images`,
                    "success"
                  );
                } else {
                  setError("No content found in the PDF");
                  showToast(
                    "No content found - The PDF appears to be empty or password protected",
                    "error"
                  );
                }
              }, 500);
            }
          }, 100);
        } else {
          setIsProcessing(false);
          setProgress(0);

          try {
            const errorData = JSON.parse(xhr.responseText);
            setError(errorData.error || "Content extraction failed");
            showToast(
              `Content extraction failed: ${
                errorData.error || "Unknown error occurred"
              }`,
              "error"
            );
          } catch (e) {
            setError("Unknown error occurred");
            showToast("Content extraction failed", "error");
          }
        }
      };

      xhr.onerror = function () {
        setIsUploading(false);
        setIsProcessing(false);
        setProgress(0);
        setError("Network error occurred");
        showToast("Network error occurred", "error");
      };

      xhr.send(formData);
    } catch (err) {
      setIsUploading(false);
      setIsProcessing(false);
      setProgress(0);
      setError("Unknown error occurred");
      showToast("Content extraction failed", "error");
    }
  };

  const handleSaveEditedPDF = async () => {
    if (!extractedData || !sessionId) {
      showToast("No data to save", "error");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("sessionId", sessionId);
    formData.append("editedData", JSON.stringify(extractedData));

    const apiUrl = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/pdf/save-edited-text`;

    try {
      const apiKey = "sk_d6c1daa54dbc95956b281fa02c544e7273ed10df60b211fe";

      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "x-api-key": apiKey },
        body: formData,
      });

      clearInterval(progressInterval);
      const data = await response.json();

      if (response.ok) {
        setProgress(100);
        setEditedFileUrl(data.filename);
        setHasUnsavedChanges(false);
        setIsProcessing(false);

        showToast(
          "PDF saved successfully! Your edited PDF with preserved images is ready for download",
          "success"
        );
      } else {
        setIsProcessing(false);
        setProgress(0);
        setError(data.error || "Save failed");
        showToast(
          `Save failed: ${data.error || "Unknown error occurred"}`,
          "error"
        );
      }
    } catch (err) {
      setIsProcessing(false);
      setProgress(0);
      setError("Unknown error occurred");
      showToast("Save failed", "error");
    }
  };

  const updateTextBlock = useCallback(
    (pageIndex: number, textIndex: number, newText: string) => {
      if (!extractedData) return;
      const newData = JSON.parse(JSON.stringify(extractedData));
      newData.pages[pageIndex].texts[textIndex].text = newText;
      setExtractedData(newData);
      setHasUnsavedChanges(true);
    },
    [extractedData]
  );

  const deleteTextBlock = useCallback(
    (pageIndex: number, textIndex: number) => {
      if (!extractedData) return;
      const newData = JSON.parse(JSON.stringify(extractedData));
      newData.pages[pageIndex].texts.splice(textIndex, 1);
      setExtractedData(newData);
      setHasUnsavedChanges(true);
    },
    [extractedData]
  );

  const handleReset = useCallback(() => {
    if (!hasUnsavedChanges) return;

    const confirm = window.confirm(
      "This will reset all changes. Are you sure?"
    );
    if (!confirm) return;

    if (originalData) {
      setExtractedData(JSON.parse(JSON.stringify(originalData)));
      setHasUnsavedChanges(false);
      setSelectedTextBlock(null);
      showToast("Reset to original", "success");
    }
  }, [hasUnsavedChanges, originalData]);

  const getTotalTextBlocks = () => {
    if (!extractedData) return 0;
    return extractedData.pages.reduce(
      (sum, page) => sum + page.texts.length,
      0
    );
  };

  const getTotalImages = () => {
    if (!extractedData) return 0;
    return extractedData.pages.reduce(
      (sum, page) => sum + (page.images?.length || 0),
      0
    );
  };

  // Render different states
  if (!extractedData && !isProcessing) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg">
          <div className="p-4 sm:p-8">
            <EnhancedFileDropzone
              onFileAccepted={handleFileUpload}
              disabled={isProcessing}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isUploading || isProcessing) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg">
          <div className="p-4 sm:p-8">
            <div className="max-w-md mx-auto space-y-6">
              {file && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              )}

              <EnhancedProgress
                progress={progress}
                isUploading={isUploading}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg">
          <div className="p-4 sm:p-8">
            <div className="max-w-md mx-auto">
              <div className="border border-red-300 bg-red-50 dark:bg-red-950/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="text-red-500">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-red-800 dark:text-red-200 text-sm">
                      {error}
                    </p>
                  </div>
                  <Button onClick={handleStartOver} variant="outline" size="sm">
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main editor interface
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl shadow-lg">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg sm:text-xl font-bold">
                  PDF Text & Image Editor
                  {hasUnsavedChanges && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 w-fit">
                      Unsaved Changes
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 mt-1">
                  <span>📄 {extractedData?.pages.length} pages</span>
                  <span className="hidden sm:inline">•</span>
                  <span>📝 {getTotalTextBlocks()} text blocks</span>
                  <span className="hidden sm:inline">•</span>
                  <span>🖼️ {getTotalImages()} images</span>
                  {file && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span>{formatFileSize(file.size)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleReset}
                disabled={!hasUnsavedChanges}
                variant="outline"
                size="sm"
              >
                🔄 Reset
              </Button>
              <Button
                onClick={handleSaveEditedPDF}
                disabled={!hasUnsavedChanges || isProcessing}
                size="sm"
              >
                💾 Save PDF
              </Button>
              <Button onClick={handleStartOver} variant="outline" size="sm">
                🆕 New PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Page Navigation */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md">
        <div className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold text-sm sm:text-base">
                Page {currentPage + 1} of {extractedData?.pages.length}
              </h3>
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  variant="outline"
                  size="sm"
                >
                  ←
                </Button>
                <Button
                  onClick={() =>
                    setCurrentPage(
                      Math.min(extractedData!.pages.length - 1, currentPage + 1)
                    )
                  }
                  disabled={currentPage === extractedData!.pages.length - 1}
                  variant="outline"
                  size="sm"
                >
                  →
                </Button>
              </div>
            </div>

            {!isMobile && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>⌨️ Ctrl+S: Save • Ctrl+R: Reset • Ctrl+←→: Navigate</span>
              </div>
            )}
          </div>

          {/* Page thumbnails */}
          {extractedData && extractedData.pages.length > 1 && (
            <div className="flex gap-1 mt-3 sm:mt-4 flex-wrap">
              {extractedData.pages.map((_, index) => (
                <Button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  variant={currentPage === index ? "default" : "outline"}
                  size="sm"
                  className="h-7 w-7 sm:h-8 sm:w-8 text-xs p-0"
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b px-4 sm:px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="visual" className="flex items-center gap-2">
                <EyeOpenIcon className="h-4 w-4" />
                Visual Editor
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <ListBulletIcon className="h-4 w-4" />
                List Editor
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 sm:p-6">
            {extractedData?.pages[currentPage] && (
              <>
                <TabsContent value="visual" className="mt-0">
                  <LibreOfficeVisualEditor
                    textBlocks={extractedData.pages[currentPage].texts}
                    imageBlocks={extractedData.pages[currentPage].images || []}
                    pageWidth={extractedData.pages[currentPage].width}
                    pageHeight={extractedData.pages[currentPage].height}
                    onTextBlockUpdate={(index, updatedBlock) => {
                      updateTextBlock(currentPage, index, updatedBlock.text);
                    }}
                    onTextBlockDelete={(index) => {
                      deleteTextBlock(currentPage, index);
                    }}
                  />
                </TabsContent>

                <TabsContent value="list" className="mt-0">
                  {/* List editor content */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-base sm:text-lg">
                        Content List
                      </h4>
                      <div className="text-sm text-gray-500 flex gap-4">
                        <span>
                          {extractedData.pages[currentPage].texts.length} text
                          blocks
                        </span>
                        <span>
                          {
                            (extractedData.pages[currentPage].images || [])
                              .length
                          }{" "}
                          images
                        </span>
                      </div>
                    </div>

                    {/* Images Section */}
                    {(extractedData.pages[currentPage].images || []).length >
                      0 && (
                      <div className="space-y-3">
                        <h5 className="font-medium text-purple-800 dark:text-purple-200 flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          Images (
                          {
                            (extractedData.pages[currentPage].images || [])
                              .length
                          }
                          )
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {(extractedData.pages[currentPage].images || []).map(
                            (imageBlock, imageIndex) => (
                              <div
                                key={imageIndex}
                                className="border rounded-lg p-3 bg-purple-50 dark:bg-purple-900/10"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">
                                    Image #{imageIndex + 1}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {imageBlock.format}
                                  </span>
                                </div>

                                <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                                  {imageBlock.image_data &&
                                  imageBlock.format !== "placeholder" ? (
                                    <img
                                      src={`data:image/${imageBlock.format};base64,${imageBlock.image_data}`}
                                      alt={`Image ${imageIndex + 1}`}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <ImageIcon className="h-8 w-8" />
                                    </div>
                                  )}
                                </div>

                                <div className="text-xs text-gray-500 space-y-1">
                                  <div>
                                    Size: {Math.round(imageBlock.width)} ×{" "}
                                    {Math.round(imageBlock.height)}px
                                  </div>
                                  <div>
                                    Position: ({Math.round(imageBlock.x0)},{" "}
                                    {Math.round(imageBlock.y0)})
                                  </div>
                                  <div className="text-purple-600">
                                    ✓ Preserved in PDF
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Text Blocks Section */}
                    {extractedData.pages[currentPage].texts.length > 0 ? (
                      <div className="space-y-3">
                        <h5 className="font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                          <Pencil1Icon className="h-4 w-4" />
                          Text Blocks (
                          {extractedData.pages[currentPage].texts.length})
                        </h5>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                          {extractedData.pages[currentPage].texts.map(
                            (textBlock, textIndex) => (
                              <div
                                key={textIndex}
                                className="border rounded-lg p-4 space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                      {textIndex + 1}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                      <span className="px-2 py-1 bg-gray-100 rounded">
                                        {textBlock.font}
                                      </span>
                                      <span className="px-2 py-1 bg-gray-100 rounded">
                                        {Math.round(textBlock.size)}px
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    onClick={() =>
                                      deleteTextBlock(currentPage, textIndex)
                                    }
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </div>

                                <Textarea
                                  value={textBlock.text}
                                  onChange={(e) =>
                                    updateTextBlock(
                                      currentPage,
                                      textIndex,
                                      e.target.value
                                    )
                                  }
                                  rows={Math.max(
                                    2,
                                    Math.ceil(textBlock.text.length / 80)
                                  )}
                                  className="resize-none"
                                />

                                <div className="text-xs text-gray-500">
                                  Position: ({Math.round(textBlock.x0)},{" "}
                                  {Math.round(textBlock.y0)}) • Size:{" "}
                                  {Math.round(textBlock.x1 - textBlock.x0)} ×{" "}
                                  {Math.round(textBlock.y1 - textBlock.y0)}px •
                                  Characters: {textBlock.text.length}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <ListBulletIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No text blocks found on this page</p>
                      </div>
                    )}

                    {/* Empty state for no content */}
                    {extractedData.pages[currentPage].texts.length === 0 &&
                      (extractedData.pages[currentPage].images || []).length ===
                        0 && (
                        <div className="text-center py-12 text-gray-500">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg
                              className="h-8 w-8"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <h3 className="font-medium mb-2">No content found</h3>
                          <p className="text-sm">
                            This page doesn't contain any text or images.
                          </p>
                        </div>
                      )}
                  </div>
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>

      {/* Success Result */}
      {editedFileUrl && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl shadow-lg">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                <CheckIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-green-800 dark:text-green-200 text-lg">
                  PDF Saved Successfully! 🎉
                </h3>
                <p className="text-green-700 dark:text-green-300 mt-1 text-sm sm:text-base">
                  Your edited PDF with preserved images is ready for download.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                  <Button asChild>
                    <a
                      href={`${
                        process.env.NEXT_PUBLIC_API_URL || ""
                      }/api/file?folder=edited&filename=${encodeURIComponent(
                        editedFileUrl
                      )}`}
                      download
                    >
                      💾 Download Edited PDF
                    </a>
                  </Button>
                  <Button onClick={handleStartOver} variant="outline">
                    🆕 Edit Another PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

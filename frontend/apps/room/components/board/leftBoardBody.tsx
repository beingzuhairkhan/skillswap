"use client";
import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Pencil, Minus, Square, Circle, Eraser, Trash2, Palette } from "lucide-react";

interface Point {
  x: number;
  y: number;
}

interface DrawData {
  start: Point;
  end: Point;
  color: string;
  size: number;
}

interface ShapeData {
  type: string;
  start: Point;
  end: Point;
  color: string;
  size: number;
}

type ToolType = "pen" | "line" | "rectangle" | "circle" | "eraser";

const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

const LeftBoardBody: React.FC = ({roomId}:{roomId:any}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [color, setColor] = useState<string>("#000000");
  const [brushSize, setBrushSize] = useState<number>(4);
  const [tool, setTool] = useState<ToolType>("pen");
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [tempCanvas, setTempCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth - 80; 
    canvas.height = window.innerHeight - 60;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;

    // Create temporary canvas for shape preview
    const temp = document.createElement("canvas");
    temp.width = canvas.width;
    temp.height = canvas.height;
    setTempCanvas(temp);

    socket.on("draw", ({ start, end, color, size }: DrawData) => {
      drawLine(start, end, color, size);
    });

    socket.on("shape", ({ type, start, end, color, size }: ShapeData) => {
      drawShape(type, start, end, color, size);
    });

    socket.on("clear", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Handle window resize
    const handleResize = () => {
      if (!canvas) return;
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = window.innerWidth - 80;
      canvas.height = window.innerHeight - 60;
      if (ctx && imageData) {
        ctx.putImageData(imageData, 0, 0);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      socket.off("draw");
      socket.off("shape");
      socket.off("clear");
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const drawLine = (start: Point, end: Point, strokeColor: string, size: number): void => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  };

  const drawShape = (type: string, start: Point, end: Point, strokeColor: string, size: number): void => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = size;
    ctx.fillStyle = "transparent";

    switch (type) {
      case "rectangle":
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        break;
      case "circle":
        const radius = Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
        );
        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      case "line":
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        break;
    }
  };

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>): void => {
    setIsDrawing(true);
    const point = getPoint(e);
    setLastPoint(point);
    setStartPoint(point);

    // Save canvas state for shape tools
    if (tool !== "pen" && tool !== "eraser") {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      if (!ctx || !canvas || !tempCanvas) return;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCtx.putImageData(imageData, 0, 0);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>): void => {
    if (!isDrawing || !lastPoint) return;
    const newPoint = getPoint(e);

    if (tool === "pen") {
      socket.emit("draw", {
  roomId,
  start: lastPoint,
  end: newPoint,
  color,
  size: brushSize,
});

      drawLine(lastPoint, newPoint, color, brushSize);
      setLastPoint(newPoint);
    } else if (tool === "eraser") {
      socket.emit("draw", {
  roomId,
  start: lastPoint,
  end: newPoint,
  color,
  size: brushSize,
});

      drawLine(lastPoint, newPoint, "#FFFFFF", brushSize * 2);
      setLastPoint(newPoint);
    } else {
      // Preview shape while drawing
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      if (!ctx || !canvas || !tempCanvas || !startPoint) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tempCanvas, 0, 0);
      drawShape(tool, startPoint, newPoint, color, brushSize);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>): void => {
    if (!isDrawing) return;

    if (tool !== "pen" && tool !== "eraser" && startPoint) {
      const endPoint = getPoint(e);
      socket.emit("shape", {
  roomId,
  type: tool,
  start: startPoint,
  end: endPoint,
  color,
  size: brushSize,
});

    }

    setIsDrawing(false);
    setLastPoint(null);
    setStartPoint(null);
  };

  const clearCanvas = (): void => {
   socket.emit("clear", roomId);

    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  interface ToolButtonProps {
    icon: React.ReactNode;
    value: ToolType;
    label: string;
  }

  const ToolButton: React.FC<ToolButtonProps> = ({ icon, value, label }) => (
    <button
      onClick={() => setTool(value)}
      className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
        tool === value
          ? "bg-black text-white shadow-xl scale-110"
          : "bg-white text-gray-700 hover:bg-gray-100 hover:scale-105 shadow-md"
      }`}
      title={label}
    >
      {icon}
      {tool === value && (
        <div className="absolute left-0 w-1 h-8 bg-white rounded-r-full" />
      )}
    </button>
  );

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Left Vertical Toolbar */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-white shadow-2xl border-r border-gray-200 z-20 flex flex-col items-center py-6">
        {/* Tool Buttons */}
        <div className="flex flex-col items-center gap-4 mb-auto">
          <ToolButton icon={<Pencil size={20} />} value="pen" label="Pen" />
          <ToolButton icon={<Minus size={20} />} value="line" label="Line" />
          <ToolButton icon={<Square size={20} />} value="rectangle" label="Rectangle" />
          <ToolButton icon={<Circle size={20} />} value="circle" label="Circle" />
          <ToolButton icon={<Eraser size={20} />} value="eraser" label="Eraser" />
          
          {/* Divider */}
          <div className="w-10 h-px bg-gray-300 my-2" />
          
          {/* Color Picker */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
            <div className="relative">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer border-2 border-gray-300 hover:border-black transition-all duration-200"
                title="Pick Color"
              />
              <Palette size={16} className="absolute top-1 right-1 pointer-events-none text-gray-400" />
            </div>
          </div>

          {/* Clear Button */}
          <button
            onClick={clearCanvas}
            className="mt-4 w-12 h-12 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center group"
            title="Clear Canvas"
          >
            <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Top Settings Bar */}
      <div className="absolute top-0 left-20 right-0 h-[60px] bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-6 h-full">
          <div className="flex items-center gap-4">
            <div className="h-6 w-px bg-gray-300" />
            <span className="text-sm text-gray-600 font-medium">
              {tool.charAt(0).toUpperCase() + tool.slice(1)}
            </span>
          </div>

          {/* Brush Size Control */}
          <div className="flex items-center gap-4 bg-white rounded-full px-6 py-2 shadow-md">
            <label className="text-sm font-semibold text-gray-700">Size:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-32 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-black"
            />
            <span className="text-sm font-bold text-black w-8 text-center">
              {brushSize}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-inner"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-gray-500 font-mono">{color}</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="absolute cursor-crosshair bg-white"
        style={{ 
          left: "80px", 
          top: "60px",
          width: "calc(100vw - 80px)",
          height: "calc(100vh - 60px)"
        }}
      />
    </div>
  );
};

export default LeftBoardBody;